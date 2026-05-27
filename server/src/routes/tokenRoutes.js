import { Router } from "express";
import {
  advanceQueue,
  createWalkinToken,
  getLiveQueue,
  getTokenStatus
} from "../controllers/tokenController.js";

const router = Router();

router.post("/walkin", createWalkinToken);
router.get("/status/:tokenId", getTokenStatus);
router.get("/live", getLiveQueue);
router.post("/advance", advanceQueue);

export default router;
