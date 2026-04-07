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
import { dbQueryLimiter, apiLimiter } from "../utills/rateLimiter.utills.js";

const router = Router();

// Protect all routes with auth + admin check
router.use(verifyAuth, isAdmin);

// Listing all bookings with filters involves potentially large DB scans
router.route("/").get(dbQueryLimiter, getAllBookings);

// Search involves multiple $or criteria and regex matching
router.route("/search").get(dbQueryLimiter, searchBookings);

// Specific booking lookup and state transitions
router.route("/:id").get(apiLimiter, getBookingById);
router.route("/:id/verify-payment").patch(apiLimiter, verifyPayment);
router.route("/:id/reject-payment").patch(apiLimiter, rejectPayment);
router.route("/:id/cancel").patch(apiLimiter, cancelBookingByAdmin);

export default router;
