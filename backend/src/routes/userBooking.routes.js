import { Router } from "express";
import verifyAuth from "../middleware/auth.middleware.js";
import { upload, uploadPaymentProof } from "../middleware/cloudinary.middleware.js";
import { ApiError } from "../utills/apiError.utills.js";
import {
  createBooking,
  getMyBookings,
  getMyBookingById,
  cancelMyBooking,
  getUpcomingBookings,
  uploadPaymentProof as uploadPaymentProofController,
} from "../controllers/booking.controllers.js";
import {getTravelSummary} from "../controllers/travelSummary.controllers.js";
import { dbQueryLimiter, apiLimiter } from "../utills/rateLimiter.utills.js";

const router = Router();

// Protect all routes with user authentication
router.use(verifyAuth);

// Summary performs complex aggregations over multiple collections
router.route("/summary").get(dbQueryLimiter, getTravelSummary);

// Booking creation involves multiple DB hits and a Cloudinary upload
router.route("/").post(dbQueryLimiter, upload.single("paymentProof"), createBooking);

// Listing routes hit the DB for multiple records
router.route("/me").get(dbQueryLimiter, getMyBookings);
router.route("/upcoming").get(dbQueryLimiter, getUpcomingBookings);

// Individual record lookups and updates
router.route("/:id").get(apiLimiter, getMyBookingById);

// Payment proof upload
router.route("/:bookingId/payment-proof").post(apiLimiter, (req, res, next) => {
  uploadPaymentProof.single("paymentProof")(req, res, (err) => {
    if (!err) return next();
    if (err?.code === "LIMIT_FILE_SIZE")
      return next(new ApiError(400, "Maximum file size is 5MB"));
    if (err?.code === "INVALID_FILE_TYPE")
      return next(new ApiError(400, err.message));
    return next(new ApiError(400, err?.message || "Invalid upload"));
  });
}, uploadPaymentProofController);

// Cancellation
router.route("/:id/cancel").patch(apiLimiter, cancelMyBooking);

export default router;
