import { nanoid } from "nanoid";
import { Booking } from "../models/Booking.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const otpStore = new Map();

const getTTLMillis = () => {
  const minutes = Number(process.env.OTP_TTL_MINUTES || 5);
  return minutes * 60 * 1000;
};

const pruneExpiredOtpRequests = () => {
  const now = Date.now();

  for (const [requestId, requestData] of otpStore.entries()) {
    if (now > requestData.expiresAt) {
      otpStore.delete(requestId);
    }
  }
};

const isValidMobile = (mobileNumber) => /^\d{10}$/.test(String(mobileNumber));
const isValidAadhaar = (aadhaar) => !aadhaar || /^\d{12}$/.test(String(aadhaar).replace(/\s/g, ""));

export const requestOtp = asyncHandler(async (req, res) => {
  const {
    city,
    centerName,
    serviceType,
    appointmentDate,
    timeSlot,
    name,
    mobileNumber,
    aadhaar
  } = req.body;

  if (!city || !centerName || !serviceType || !appointmentDate || !timeSlot || !name || !mobileNumber) {
    return res.status(400).json({ message: "Please fill all required fields." });
  }

  if (!isValidMobile(mobileNumber)) {
    return res.status(400).json({ message: "Mobile number must be a valid 10-digit number." });
  }

  if (!isValidAadhaar(aadhaar)) {
    return res.status(400).json({ message: "Aadhaar must contain 12 digits when provided." });
  }

  pruneExpiredOtpRequests();

  const requestId = nanoid(10);
  const otp = String(Math.floor(100000 + Math.random() * 900000));

  otpStore.set(requestId, {
    otp,
    expiresAt: Date.now() + getTTLMillis(),
    payload: {
      city,
      centerName,
      serviceType,
      appointmentDate,
      timeSlot,
      name,
      mobileNumber,
      aadhaar: aadhaar || ""
    }
  });

  return res.status(200).json({
    message: "OTP generated successfully.",
    requestId,
    debugOtp: otp
  });
});

export const verifyOtpAndCreateBooking = asyncHandler(async (req, res) => {
  const { requestId, otp } = req.body;

  if (!requestId || !otp) {
    return res.status(400).json({ message: "requestId and OTP are required." });
  }

  const requestData = otpStore.get(requestId);

  if (!requestData) {
    return res.status(400).json({ message: "OTP request not found. Please retry." });
  }

  if (Date.now() > requestData.expiresAt) {
    otpStore.delete(requestId);
    return res.status(400).json({ message: "OTP expired. Please request a new one." });
  }

  if (requestData.otp !== String(otp)) {
    return res.status(400).json({ message: "Invalid OTP." });
  }

  const bookingId = `BK-${new Date().getFullYear()}-${nanoid(6).toUpperCase()}`;
  const booking = await Booking.create({
    bookingId,
    ...requestData.payload
  });

  otpStore.delete(requestId);

  return res.status(201).json({
    message: "Booking confirmed successfully.",
    booking
  });
});

export const getBookingById = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findOne({ bookingId });

  if (!booking) {
    return res.status(404).json({ message: "Booking not found." });
  }

  return res.status(200).json({ booking });
});
