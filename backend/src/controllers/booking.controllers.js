import asyncHandler from "../utills/asynchandler.utills.js";
import Package from "../models/packages.models.js";
import Booking from "../models/booking.models.js";
import { ApiError } from "../utills/apiError.utills.js";
import { ApiResponse } from "../utills/apiResponse.utills.js";
import cloudinaryImageUpload from "../utills/cloudinary.utills.js";

// Create a new booking
export const createBooking = asyncHandler(async (req, res) => {
  const { package: packageId, numPeople = 1, travelDate, notes } = req.body;
  const userId = req.user._id;

  // Validate package exists
  const pkg = await Package.findById(packageId);
  if (!pkg) throw new ApiError(404, "Package not found");

  // Upload payment proof if provided
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

  // Create package snapshot
  const packageSnapshot = {
    title: pkg.title,
    destination: pkg.location,
    durationDays: pkg.duration,
    basePrice: pkg.price,
    images: [pkg.image],
    includes: pkg.includes || [],
    excludes: pkg.excludes || [],
  };

  // Calculate total price
  const totalPrice = pkg.price * numPeople;

  // Create booking
  const booking = await Booking.create({
    user: userId,
    package: packageId,
    numPeople,
    packageSnapshot,
    currency: "USD",
    pricePerPerson: pkg.price,
    totalPrice,
    travelDate: travelDate || null,
    notes: notes || null,
    paymentProof,
    bookingStatus: "Pending",
    paymentStatus: "NotPaid",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, booking, "Booking created successfully"));
});

// Get all bookings by user
export const getMyBookings = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const bookings = await Booking.find({ user: userId })
    .sort({ bookingDate: -1 })
    .select("-__v");

  return res
    .status(200)
    .json(
      new ApiResponse(200, bookings, "Your bookings retrieved successfully")
    );
});

// Get a single booking by ID
export const getMyBookingById = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const bookingId = req.params.id;

  const booking = await Booking.findById(bookingId).select("-__v");
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.user.toString() !== userId.toString())
    throw new ApiError(403, "Access denied");

  return res
    .status(200)
    .json(
      new ApiResponse(200, booking, "Booking details retrieved successfully")
    );
});

// Cancel a booking by user
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

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking cancelled successfully"));
});
