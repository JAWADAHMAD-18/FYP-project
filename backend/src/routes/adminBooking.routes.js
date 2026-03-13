import { Router } from "express";
import verifyAuth from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import {
  getAllBookings,
  getBookingById,
  verifyPayment,
  rejectPayment,
  cancelBookingByAdmin,
  searchBookings,
} from "../controllers/adminBooking.controllers.js";

const router = Router();

// Protect all routes with auth + admin check
router.use(verifyAuth, isAdmin);

// Get all bookings (with optional filters)
router.route("/").get(getAllBookings);

// Search bookings by packageId, userId, bookingCode, or q
router.route("/search").get(searchBookings);

// Get single booking by ID
router.route("/:id").get(getBookingById);

// Verify payment for a booking
router.route("/:id/verify-payment").patch(verifyPayment);

// Reject payment for a booking
router.route("/:id/reject-payment").patch(rejectPayment);

// Cancel a booking by admin
router.route("/:id/cancel").patch(cancelBookingByAdmin);

export default router;
