import asyncHandler from "../utills/asynchandler.utills.js";
import Booking from "../models/booking.models.js";
import { ApiError } from "../utills/apiError.utills.js";
import { ApiResponse } from "../utills/apiResponse.utills.js";
import { invalidateDashboardCache } from "./adminDashboardSummary.controllers.js";

// Get all bookings (admin)
export const getAllBookings = asyncHandler(async (req, res) => {
  // Optional filters: bookingStatus, paymentStatus, packageId, userId
  const { bookingStatus, paymentStatus, packageId, userId } = req.query;

  const query = {};

  if (bookingStatus) query.bookingStatus = bookingStatus;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (packageId) query.package = packageId;
  if (userId) query.user = userId;

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

  booking.paymentStatus = "Paid";
  booking.bookingStatus = "Confirmed";
  booking.paymentProof.verified = true;
  booking.paymentProof.verifiedBy = adminId;
  booking.paymentProof.verifiedAt = new Date();

  await booking.save();
  invalidateDashboardCache();

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

  booking.paymentStatus = "NotPaid";
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

  await booking.save();
  invalidateDashboardCache();

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking cancelled successfully"));
});

// Search bookings by packageId, userId, bookingStatus, paymentStatus
export const searchBookings = asyncHandler(async (req, res) => {
  const { packageId, userId, bookingStatus, paymentStatus } = req.query;

  // Build query dynamically
  const query = {};
  if (packageId) query.package = packageId;
  if (userId) query.user = userId;
  if (bookingStatus) query.bookingStatus = bookingStatus;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  if (!packageId && !userId && !bookingStatus && !paymentStatus) {
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
