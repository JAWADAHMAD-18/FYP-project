import asyncHandler from "../utills/asynchandler.utills.js";
import Package from "../models/packages.models.js";
import { ApiError } from "../utills/apiError.utills.js";
import { ApiResponse } from "../utills/apiResponse.utills.js";


// Get a single package by ID
export const getPackage = asyncHandler(async (req, res) => {
  const { packageId } = req.params;

  const packageData = await Package.findById(packageId).lean();

  if (!packageData) {
    throw new ApiError(404, "Package not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Package retrieved successfully", packageData));
});

// Get all packages (no pagination)
export const getAllPackages = asyncHandler(async (req, res) => {
  const packages = await Package.find()
    .sort({ createdAt: -1 }) // Newest first
    .lean();

  return res.status(200).json(
    new ApiResponse(200, "Packages retrieved successfully", {
      packages,
      total: packages.length,
    })
  );
});

// Get active packages (available=true and end_date > now)
export const getActivePackages = asyncHandler(async (req, res) => {
  const currentDate = new Date();

  const packages = await Package.find({
    available: true,
    end_date: { $gt: currentDate },
  })
    .sort({ start_date: 1 }) // Soonest first
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Active packages retrieved successfully", packages)
    );
});

// Get packages by trip type (domestic/international)
export const getPackagesByType = asyncHandler(async (req, res) => {
  const { tripType } = req.params;

  // Validate trip type
  if (!["domestic", "international"].includes(tripType)) {
    throw new ApiError(
      400,
      "Invalid trip type. Must be 'domestic' or 'international'"
    );
  }

  const currentDate = new Date();

  const packages = await Package.find({
    trip_type: tripType,
    available: true,
    end_date: { $gt: currentDate },
  })
    .select("-imagePublicId")
    .sort({ start_date: 1 })
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `${
          tripType.charAt(0).toUpperCase() + tripType.slice(1)
        } packages retrieved successfully`,
        packages
      )
    );
});
