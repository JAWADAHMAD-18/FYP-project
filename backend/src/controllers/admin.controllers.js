// TODO: Add CRUD operations for packages and booking
import asyncHandler from "../utills/asynchandler.utills.js";
import Package from "../models/packages.models.js";
import Booking from "../models/booking.models.js";
import User from "../models/users.models.js";
import { ApiError } from "../utills/apiError.utills.js";
import { ApiResponse } from "../utills/apiResponse.utills.js";
import cloudinaryImageUpload from "../utills/cloudinary.utills.js";
import { v2 as cloudinary } from "cloudinary";

// Add a new package
export const addPackage = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    duration,
    available,
    location,
    trip_type,
    start_date,
    end_date,
    available_slot,
  } = req.body;

  const fileLocalPath = req.file?.path;

  if (!fileLocalPath) {
    throw new ApiError(400, "Image is required");
  }
  const imageUpload = await cloudinaryImageUpload(fileLocalPath);
  if (!imageUpload) {
    throw new ApiError(400, "Failed to upload image on cloudinary");
  }
  const newPackage = await Package.create({
    title,
    description,
    price,
    duration,
    available,
    location,
    trip_type,
    start_date,
    end_date,
    available_slot,
  image: imageUpload.url,
  imagePublicId: imageUpload.public_id,
    // createdBy: req.user._id,
  });
  return res.status(201).json(
    new ApiResponse(201, "Package added successfully", newPackage)
  );
});
//update a package
export const updatePackage = asyncHandler(async (req, res) => {
  const { packageId } = req.params;
  const updates = req.body;
  
  // Validate package exists and admin has access
  const existingPackage = await Package.findById(packageId).select('image imagePublicId createdBy').lean();
  if (!existingPackage) {
    throw new ApiError(404, "Package not found");
  }

  // Handle image upload if new image is provided
  if (req.file?.path) {
    const imageUpload = await cloudinaryImageUpload(req.file.path);
    if (!imageUpload) {
      throw new ApiError(400, "Failed to upload new image");
    }
    updates.image = imageUpload.url;
    updates.imagePublicId = imageUpload.public_id;

    // ---------- DELETE OLD IMAGE ON CLOUDINARY (a bit below this block) ----------
    // If there was a previous image public id, remove it from Cloudinary
    const oldPublicId = existingPackage.imagePublicId;
    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, { resource_type: "image" });
      } catch (err) {
        // Log but don't fail the whole request for deletion errors
        console.log("Failed to destroy old Cloudinary image", err);
      }
    }
  }

  // Update package with new data
  const updatedPackage = await Package.findByIdAndUpdate(
    packageId,
    { $set: updates },
    { new: true, runValidators: true }
  ).lean();

  return res.status(200).json(
    new ApiResponse(200, "Package updated successfully", updatedPackage)
  );
});

// Delete a package
export const deletePackage = asyncHandler(async (req, res) => {
  const { packageId } = req.params;

  // Check if package exists
  const packageToDelete = await Package.findById(packageId).lean();
  if (!packageToDelete) {
    throw new ApiError(404, "Package not found");
  }

  // Check for active bookings in a single query
  const activeBookings = await Booking.exists({
    package: packageId,
    status: { $in: ['pending', 'confirmed'] }
  });

  if (activeBookings) {
    throw new ApiError(400, "Cannot delete package with active bookings");
  }

  // Delete the package
  await Package.findByIdAndDelete(packageId);

  return res.status(200).json(
    new ApiResponse(200, "Package deleted successfully", null)
  );
});

// Get a single package by ID
export const getPackage = asyncHandler(async (req, res) => {
  const { packageId } = req.params;
  
  const packageData = await Package.findById(packageId)
    .lean()
    .select('-imagePublicId'); // Don't expose Cloudinary public_id
  
  if (!packageData) {
    throw new ApiError(404, "Package not found");
  }

  return res.status(200).json(
    new ApiResponse(200, "Package retrieved successfully", packageData)
  );
});

// Get all packages with optional pagination
export const getAllPackages = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const packages = await Package.find()
    .select('-imagePublicId')
    .sort({ createdAt: -1 }) // Newest first
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Package.countDocuments();

  return res.status(200).json(
    new ApiResponse(200, "Packages retrieved successfully", {
      packages,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: skip + packages.length < total
      }
    })
  );
});

// Get active packages (available=true and end_date > now)
export const getActivePackages = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  
  const packages = await Package.find({
    available: true,
    end_date: { $gt: currentDate }
  })
    .select('-imagePublicId')
    .sort({ start_date: 1 }) // Soonest first
    .lean();

  return res.status(200).json(
    new ApiResponse(200, "Active packages retrieved successfully", packages)
  );
});

// Get packages by trip type (domestic/international)
export const getPackagesByType = asyncHandler(async (req, res) => {
  const { tripType } = req.params;
  
  // Validate trip type
  if (!["domestic", "international"].includes(tripType)) {
    throw new ApiError(400, "Invalid trip type. Must be 'domestic' or 'international'");
  }

  const currentDate = new Date();
  
  const packages = await Package.find({
    trip_type: tripType,
    available: true,
    end_date: { $gt: currentDate }
  })
    .select('-imagePublicId')
    .sort({ start_date: 1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      `${tripType.charAt(0).toUpperCase() + tripType.slice(1)} packages retrieved successfully`,
      packages
    )
  );
});
