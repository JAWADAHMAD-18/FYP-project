import mongoose from "mongoose";
import asyncHandler from "../utills/asynchandler.utills.js";
import Package from "../models/packages.models.js";
import Booking from "../models/booking.models.js";
import { ApiError } from "../utills/apiError.utills.js";
import { ApiResponse } from "../utills/apiResponse.utills.js";
import cloudinaryImageUpload from "../utills/cloudinary.utills.js";
import { invalidateDashboardCache } from "./adminDashboardSummary.controllers.js";
// ─── Email service (fire-and-forget — never blocks a response) ───────────────
import {
  sendBookingCreatedEmail,
  sendBookingCancelledEmail,
} from "../services/email.service.js";
// For payment/approval emails, see: adminBooking.controllers.js
// sendBookingApprovedEmail, sendPaymentApprovedEmail, sendPaymentCancelledEmail

// Create a new booking
export const createBooking = asyncHandler(async (req, res) => {
  const { package: packageId, numPeople = 1, notes } = req.body;
  const userId = req.user._id;

  const parsedNumPeople = parseInt(numPeople, 10);
  if (!packageId) throw new ApiError(400, "Package ID is required");
  if (isNaN(parsedNumPeople) || parsedNumPeople < 1)
    throw new ApiError(400, "numPeople must be a positive integer");

  // Upload payment proof before opening transaction (I/O outside critical section)
  let paymentProof = {
    imageUrl: null,
    uploadedAt: null,
    verified: false,
    verifiedBy: null,
    verifiedAt: null,
  };

  if (req.file?.path) {
    const uploadResult = await cloudinaryImageUpload(req.file.path);
    if (!uploadResult)
      throw new ApiError(500, "Failed to upload payment proof");
    paymentProof.imageUrl = uploadResult.url;
    paymentProof.uploadedAt = new Date();
  }

  // ── Attempt with Mongoose session (requires replica set) ──────────────────
  let booking;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Lock-read within transaction
      const pkg = await Package.findById(packageId).session(session);
      if (!pkg) throw new ApiError(404, "Package not found");
      if (pkg.available === false)
        throw new ApiError(400, "This package is no longer available");

      const availableSlots = Number(pkg.available_slot ?? 0);
      if (availableSlots < parsedNumPeople)
        throw new ApiError(
          400,
          `Not enough available slots. Only ${availableSlots} slot(s) remaining.`
        );

      // Server-side price calculation — never trust client total
      const pricePerPerson = Number(pkg.price);
      const totalPrice = pricePerPerson * parsedNumPeople;

      // Loyalty savings: 5% for bookings under 500,000; 10% for larger bookings
      const savingsRate = totalPrice < 500_000 ? 0.05 : 0.1;
      const savings = Math.round(totalPrice * savingsRate);

      // Package snapshot — immutable record of package at booking time
      const packageSnapshot = {
        title: pkg.title,
        destination: pkg.location,
        durationDays: pkg.durationDays,
        basePrice: pkg.price,
        category: pkg.category,
        tripType: pkg.trip_type,
        start_date: pkg.start_date,
        end_date: pkg.end_date,
        images: [pkg.coverImage || pkg.image].filter(Boolean),
        includes: pkg.includes || [],
        excludes: pkg.excludes || [],
      };

      // Atomically decrement available_slot
      const updated = await Package.findByIdAndUpdate(
        packageId,
        { $inc: { available_slot: -parsedNumPeople } },
        { session, new: true }
      );
      if (!updated)
        throw new ApiError(500, "Failed to update package availability");

      // Create booking within the same transaction
      const created = await Booking.create(
        [
          {
            user: userId,
            package: packageId,
            numPeople: parsedNumPeople,
            packageSnapshot,
            currency: "PKR",
            pricePerPerson,
            totalPrice,
            savings,
            durationDays: pkg.durationDays,
            durationNights: pkg.durationNights,
            start_date: pkg.start_date,
            end_date: pkg.end_date,
            // travelDate is fixed from the package's start_date
            travelDate: pkg.start_date || null,
            notes: notes || null,
            paymentProof,
            bookingStatus: "Pending",
            payment_status: "pending_payment",
          },
        ],
        { session }
      );

      booking = created[0];
    });
  } catch (err) {
    // Surface ApiErrors directly; wrap unexpected errors
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      500,
      err?.message || "Booking failed. Please try again."
    );
  } finally {
    session.endSession();
  }

  // Return clean response — both payment fields always included
  const responsePayload = {
    bookingId: booking._id,
    bookingCode: booking.bookingCode,
    bookingStatus: booking.bookingStatus,
    paymentStatus: booking.paymentStatus,       // financial truth
    payment_status: booking.payment_status,     // workflow state
    numPeople: booking.numPeople,
    pricePerPerson: booking.pricePerPerson,
    totalPrice: booking.totalPrice,
    savings: booking.savings,
    durationDays: booking.durationDays,
    durationNights: booking.durationNights,
    travelDate: booking.travelDate,
    start_date: booking.start_date,
    end_date: booking.end_date,
    packageSnapshot: booking.packageSnapshot,
    createdAt: booking.createdAt,
  };

  invalidateDashboardCache();

  // ─── Send booking-created email (non-blocking) ───────────────────────────
  // req.user has { name, email } from verifyAuth middleware.
  // booking.packageSnapshot contains the snapshot saved during this transaction.
  sendBookingCreatedEmail({ user: req.user, booking });
  // ────────────────────────────────────────────────────────────────────────

  return res
    .status(201)
    .json(
      new ApiResponse(201, responsePayload, "Booking created successfully")
    );
});

// ─── Get all bookings for the logged-in user
export const getMyBookings = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const bookings = await Booking.find({ user: userId })
    .sort({ bookingDate: -1 })
    .select("-__v")
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(200, bookings, "Your bookings retrieved successfully")
    );
});

// ─── Get a single booking by ID (owner-only)
export const getMyBookingById = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const bookingId = req.params.id;

  const booking = await Booking.findById(bookingId).select("-__v").lean();
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.user.toString() !== userId.toString())
    throw new ApiError(403, "Access denied");

  return res
    .status(200)
    .json(
      new ApiResponse(200, booking, "Booking details retrieved successfully")
    );
});

// ─── Cancel a booking (owner-only)
export const cancelMyBooking = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const bookingId = req.params.id;
  const { cancelReason } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.user.toString() !== userId.toString())
    throw new ApiError(403, "Access denied");

  if (booking.bookingStatus === "Cancelled")
    throw new ApiError(400, "Booking already cancelled");

  booking.bookingStatus = "Cancelled";
  booking.cancelledBy = "User";
  booking.cancelReason = cancelReason || null;
  booking.cancelledAt = new Date();

  await booking.save();
  invalidateDashboardCache();

  // ─── Send booking-cancelled email (non-blocking) ─────────────────────────
  // req.user is populated by verifyAuth — has name + email already.
  sendBookingCancelledEmail({ user: req.user, booking });
  // ────────────────────────────────────────────────────────────────────────

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking cancelled successfully"));
});

// ─── Get upcoming bookings for the logged-in user (travelDate >= today)
export const getUpcomingBookings = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bookings = await Booking.find({
    user: userId,
    travelDate: { $gte: today },
  })
    .sort({ travelDate: 1 })
    .select("-__v")
    .lean();

  console.log("User ID:", req.user._id);
  console.log("Today:", today);
  console.log("Upcoming bookings found:", bookings.length);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        bookings,
        "Upcoming bookings retrieved successfully"
      )
    );
});

// ─── Upload payment proof for a booking (owner-only)
export const uploadPaymentProof = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const bookingId = req.params.bookingId;
  const paymentNote = req.body?.payment_note ?? null;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.user.toString() !== userId.toString())
    throw new ApiError(403, "Access denied");

  // Prevent re-upload if already present
  if (booking.payment_proof_url || booking.paymentProof?.imageUrl)
    throw new ApiError(400, "Payment proof already uploaded");

  if (!req.file?.path) throw new ApiError(400, "Payment proof image is required");

  const uploadResult = await cloudinaryImageUpload(req.file.path);
  if (!uploadResult) throw new ApiError(500, "Failed to upload payment proof");

  // ── Workflow state: user has submitted proof, awaiting admin review ────────
  // IMPORTANT: do NOT touch paymentStatus here — that is the financial truth
  // field and is only mutated by admin controllers (verifyPayment / rejectPayment).
  booking.payment_proof_url = uploadResult.url;
  booking.payment_note = paymentNote || null;
  booking.payment_status = "payment_submitted";

  // Keep legacy paymentProof.imageUrl in sync (admin UI reads this for the proof image)
  booking.paymentProof = booking.paymentProof || {};
  booking.paymentProof.imageUrl = uploadResult.url;
  booking.paymentProof.uploadedAt = new Date();

  await booking.save();
  invalidateDashboardCache();

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Payment proof uploaded successfully"));
});
