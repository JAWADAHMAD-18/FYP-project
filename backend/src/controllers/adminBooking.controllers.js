import asyncHandler from "../utills/asynchandler.utills.js";
import Booking from "../models/booking.models.js";
import { ApiError } from "../utills/apiError.utills.js";
import { ApiResponse } from "../utills/apiResponse.utills.js";
import { invalidateDashboardCache } from "./adminDashboardSummary.controllers.js";
import User from "../models/users.models.js";
import {
  sendBookingApprovedEmail,
  sendPaymentApprovedEmail,
  sendBookingCancelledEmail,
  sendPaymentCancelledEmail,
} from "../services/email.service.js";

// Get all bookings (admin)
export const getAllBookings = asyncHandler(async (req, res) => {
  // Optional filters: bookingStatus, paymentStatus, packageId, userId
  const { bookingStatus, paymentStatus, packageId, userId, bookingType } = req.query;

  const query = {};

  if (bookingStatus) query.bookingStatus = bookingStatus;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (packageId) query.package = packageId;
  if (userId) query.user = userId;
  if (bookingType) query.bookingType = bookingType;

  const bookings = await Booking.find(query)
    .sort({ bookingDate: -1 })
    .select("-__v")
    .populate("user", "name email") // basic user info
    .populate("package", "title location price"); // optional package ref

  return res
    .status(200)
    .json(
      new ApiResponse(200, bookings, "All bookings retrieved successfully")
    );
});

// Verify payment of a booking
export const verifyPayment = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const adminId = req.user._id;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  if (!booking.paymentProof.imageUrl)
    throw new ApiError(400, "No payment proof uploaded");

  // ── Financial truth field (used by revenue, emails, admin decisions) ──
  booking.paymentStatus = "Paid";
  // ── Workflow state field (used by UI and booking flow) ─────────────────
  booking.payment_status = "payment_verified";

  booking.bookingStatus = "Confirmed";
  booking.paymentProof.verified = true;
  booking.paymentProof.verifiedBy = adminId;
  booking.paymentProof.verifiedAt = new Date();

  await booking.save();
  invalidateDashboardCache();

  // ─── Send payment-approved + booking-approved emails (non-blocking) ───────
  
  User.findById(booking.user).select("name email").lean().then((user) => {
    if (user) {
      sendPaymentApprovedEmail({ user, booking });  // "Payment Verified" email
      sendBookingApprovedEmail({ user, booking });  // "Booking Confirmed" email
    }
  }).catch(() => {}); // silent fallback

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Payment verified successfully"));
});

// Reject payment of a booking
export const rejectPayment = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const { reason } = req.body; // optional rejection reason
  const adminId = req.user._id;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  // ── Sync both payment fields on rejection ──────────────────────────────
  booking.paymentStatus = "NotPaid";
  booking.payment_status = "pending_payment";

  booking.bookingStatus = "Pending";
  booking.paymentProof.verified = false;
  booking.paymentProof.verifiedBy = adminId;
  booking.paymentProof.verifiedAt = new Date();
  booking.notes = reason || "Payment rejected by admin";

  await booking.save();
  invalidateDashboardCache();

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Payment rejected successfully"));
});

// Cancel a booking
export const cancelBookingByAdmin = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const { cancelReason } = req.body;
  const adminId = req.user._id;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.bookingStatus === "Cancelled")
    throw new ApiError(400, "Booking already cancelled");

  booking.bookingStatus = "Cancelled";
  booking.cancelledBy = "Admin";
  booking.cancelReason = cancelReason || null;
  booking.cancelledAt = new Date();

  // ── Persist refund state BEFORE save so it reaches the database ─────────
  // Bug fix: previously paymentStatus="Refunded" was set AFTER save() and
  // was never persisted — refunded bookings incorrectly counted as revenue.
  const wasAlreadyPaid = booking.paymentStatus === "Paid";
  if (wasAlreadyPaid) {
    booking.paymentStatus = "Refunded";     // financial truth — now persisted
    booking.payment_status = "refunded";    // workflow state — kept in sync
  }

  await booking.save();
  invalidateDashboardCache();

  // ─── Send cancellation + refund emails (non-blocking) ──────────────────
  User.findById(booking.user).select("name email").lean().then((user) => {
    if (user) {
      sendBookingCancelledEmail({ user, booking }); // "Booking Cancelled" email
      if (wasAlreadyPaid) {
        sendPaymentCancelledEmail({ user, booking }); // "Refund Initiated" email
      }
    }
  }).catch(() => {}); // silent fallback
  // ────────────────────────────────────────────────────────────────────

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking cancelled successfully"));
});

// Get a single booking by ID (admin)
export const getBookingById = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const booking = await Booking.findById(bookingId)
    .select("-__v")
    .populate("user", "name email")
    .populate("package", "title location price");
  if (!booking) throw new ApiError(404, "Booking not found");
  return res
    .status(200)
    .json(
      new ApiResponse(200, booking, "Booking details retrieved successfully")
    );
});

// Search bookings by packageId, userId, bookingStatus, paymentStatus, or bookingCode
export const searchBookings = asyncHandler(async (req, res) => {
  const { packageId, userId, bookingStatus, paymentStatus, bookingType, q } = req.query;

  const query = {};
  if (packageId) query.package = packageId;
  if (userId) query.user = userId;
  if (bookingStatus) query.bookingStatus = bookingStatus;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (bookingType) query.bookingType = bookingType;

  if (q && q.trim()) {
    const term = q.trim();
    const mongoose = (await import("mongoose")).default;
    if (mongoose.Types.ObjectId.isValid(term) && term.length === 24) {
      query.$or = [
        { user: term },
        { package: term },
      ];
    } else {
      query.bookingCode = { $regex: term, $options: "i" };
    }
  }

  if (
    !packageId &&
    !userId &&
    !bookingStatus &&
    !paymentStatus &&
    !(q && q.trim())
  ) {
    throw new ApiError(400, "At least one filter parameter is required");
  }

  const bookings = await Booking.find(query)
    .sort({ bookingDate: -1 })
    .select("-__v")
    .populate("user", "name email")
    .populate("package", "title location price");

  return res
    .status(200)
    .json(new ApiResponse(200, bookings, "Bookings retrieved successfully"));
});
