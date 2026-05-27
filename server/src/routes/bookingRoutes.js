import { Router } from "express";
import {
  getBookingById,
  requestOtp,
  verifyOtpAndCreateBooking
} from "../controllers/bookingController.js";

const router = Router();

router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtpAndCreateBooking);
router.get("/:bookingId", getBookingById);

export default router;
