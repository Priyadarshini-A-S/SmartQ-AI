import { nanoid } from "nanoid";
import { Token } from "../models/Token.js";
import { QueueState } from "../models/QueueState.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const todayDate = () => new Date().toISOString().slice(0, 10);

const getCrowdLevel = (totalWaiting) => {
  if (totalWaiting <= 10) return "Low";
  if (totalWaiting <= 25) return "Medium";
  return "High";
};

const getEstimatedWait = (tokenNumber, nowServing) =>
  Math.max(tokenNumber - nowServing, 0) * 3;

const getOrCreateQueueState = (centerName, queueDate) =>
  QueueState.findOneAndUpdate(
    { centerName, queueDate },
    { $setOnInsert: { centerName, queueDate, nowServing: 0, nextTokenNumber: 1 } },
    { upsert: true, new: true }
  );

export const createWalkinToken = asyncHandler(async (req, res) => {
  const { centerName, customerName, serviceType } = req.body;

  if (!centerName || !customerName || !serviceType) {
    return res.status(400).json({ message: "centerName, customerName and serviceType are required." });
  }

  const queueDate = todayDate();

  const queueState = await QueueState.findOneAndUpdate(
    { centerName, queueDate },
    { $setOnInsert: { centerName, queueDate, nowServing: 0 }, $inc: { nextTokenNumber: 1 } },
    { upsert: true, new: true }
  );
  const tokenNumber = queueState.nextTokenNumber;

  const token = await Token.create({
    tokenId: `TK-${nanoid(8).toUpperCase()}`,
    tokenNumber,
    centerName,
    customerName,
    serviceType,
    queueDate,
    status: "waiting"
  });

  return res.status(201).json({
    message: "Walk-in token created.",
    token,
    nowServing: queueState.nowServing,
    estimatedWaitMinutes: getEstimatedWait(tokenNumber, queueState.nowServing)
  });
});

export const getTokenStatus = asyncHandler(async (req, res) => {
  const { tokenId } = req.params;
  const token = await Token.findOne({ tokenId });

  if (!token) return res.status(404).json({ message: "Token not found." });

  const queueState = await getOrCreateQueueState(token.centerName, token.queueDate);

  return res.status(200).json({
    tokenId: token.tokenId,
    yourToken: token.tokenNumber,
    nowServing: queueState.nowServing,
    estimatedWaitMinutes: getEstimatedWait(token.tokenNumber, queueState.nowServing),
    centerName: token.centerName,
    status: token.status,
    crowdLevel: getCrowdLevel(Math.max(token.tokenNumber - queueState.nowServing, 0))
  });
});

export const getLiveQueue = asyncHandler(async (req, res) => {
  const centerName = req.query.centerName || "Central Aadhaar Center";
  const queueDate = todayDate();

  const queueState = await getOrCreateQueueState(centerName, queueDate);
  const totalIssued = await Token.countDocuments({ centerName, queueDate });
  const totalWaiting = Math.max(totalIssued - queueState.nowServing, 0);

  return res.status(200).json({
    centerName,
    nowServing: queueState.nowServing,
    totalIssued,
    totalWaiting,
    crowdLevel: getCrowdLevel(totalWaiting),
    refreshedAt: new Date().toISOString()
  });
});

export const advanceQueue = asyncHandler(async (req, res) => {
  const { centerName } = req.body;

  if (!centerName) return res.status(400).json({ message: "centerName is required." });

  const queueDate = todayDate();
  const queueState = QueueState._getDoc(centerName, queueDate);
  const totalIssued = await Token.countDocuments({ centerName, queueDate });

  if (queueState.nowServing >= totalIssued) {
    return res.status(200).json({
      message: "No waiting tokens to advance.",
      centerName,
      nowServing: queueState.nowServing
    });
  }

  if (queueState.nowServing > 0) {
    await Token.findOneAndUpdate(
      { centerName, queueDate, tokenNumber: queueState.nowServing },
      { $set: { status: "completed" } }
    );
  }

  queueState.nowServing += 1;
  await queueState.save();

  await Token.findOneAndUpdate(
    { centerName, queueDate, tokenNumber: queueState.nowServing },
    { $set: { status: "serving" } }
  );

  return res.status(200).json({
    message: "Queue advanced.",
    centerName,
    nowServing: queueState.nowServing
  });
});
