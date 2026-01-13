import { Router } from "express";
import verifyAuth from "../middleware/auth.middleware.js";
import { upload } from "../middleware/cloudinary.middleware.js";

import {
  createBooking,
  getMyBookings,
  getMyBookingById,
  cancelMyBooking,
} from "../controllers/booking.controllers.js";

const router = Router();

// Protect all routes with user authentication
router.use(verifyAuth);

router.route("/").post(upload.single("paymentProof"), createBooking);

router.route("/me").get(getMyBookings);

router.route("/:id").get(getMyBookingById);

router.route("/:id/cancel").patch(cancelMyBooking);

export default router;
