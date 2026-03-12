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
const router = Router();

// Protect all routes with user authentication
router.use(verifyAuth);
router.route("/summary").get(getTravelSummary);


router.route("/").post(upload.single("paymentProof"), createBooking);

router.route("/me").get(getMyBookings);

router.route("/upcoming").get(getUpcomingBookings);

router.route("/:id").get(getMyBookingById);

router.route("/:bookingId/payment-proof").post((req, res, next) => {
  uploadPaymentProof.single("paymentProof")(req, res, (err) => {
    if (!err) return next();
    if (err?.code === "LIMIT_FILE_SIZE")
      return next(new ApiError(400, "Maximum file size is 5MB"));
    if (err?.code === "INVALID_FILE_TYPE")
      return next(new ApiError(400, err.message));
    return next(new ApiError(400, err?.message || "Invalid upload"));
  });
}, uploadPaymentProofController);

router.route("/:id/cancel").patch(cancelMyBooking);

export default router;
