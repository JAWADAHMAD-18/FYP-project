import asyncHandler from "../utills/asynchandler.utills.js";
import Package from "../models/packages.models.js";
import { ApiError } from "../utills/apiError.utills.js";
import { ApiResponse } from "../utills/apiResponse.utills.js";

// Explicit public-safe fields (no internal IDs beyond _id, no secrets, no admin metadata)
const PUBLIC_PACKAGE_SELECT = [
  "title",
  "price",
  "description",
  "highlights",
  "duration",
  "location",
  "city",
  "trip_type",
  "start_date",
  "end_date",
  "available",
  "available_slot",
  // media
  "image", // legacy
  "coverImage",
  "images",
].join(" ");

const normalizeMedia = (pkg) => {
  if (!pkg) return pkg;
  const cover = pkg.coverImage || pkg.image || null;
  const images = Array.isArray(pkg.images) ? pkg.images.filter(Boolean) : [];
  return {
    ...pkg,
    coverImage: cover,
    images: Array.from(new Set([cover, ...images].filter(Boolean))),
  };
};

// Get a single package by ID
export const getPackage = asyncHandler(async (req, res) => {
  const { packageId } = req.params;

  const packageData = await Package.findById(packageId)
    .select(PUBLIC_PACKAGE_SELECT)
    .lean();

  if (!packageData) {
    throw new ApiError(404, "Package not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, normalizeMedia(packageData), "Package retrieved successfully")
    );
});

// Get all packages (no pagination)
export const getAllPackages = asyncHandler(async (req, res) => {
  const packages = await Package.find()
    .select(PUBLIC_PACKAGE_SELECT)
    .sort({ createdAt: -1 }) // Newest first
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        packages: packages.map(normalizeMedia),
        total: packages.length,
      },
      "Packages retrieved successfully"
    )
  );
});

// Get active packages (available=true and end_date > now)
export const getActivePackages = asyncHandler(async (req, res) => {
  const currentDate = new Date();

  const packages = await Package.find({
    available: true,
    end_date: { $gt: currentDate },
  })
    .select(PUBLIC_PACKAGE_SELECT)
    .sort({ start_date: 1 }) // Soonest first
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        packages.map(normalizeMedia),
        "Active packages retrieved successfully"
      )
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
    .select(PUBLIC_PACKAGE_SELECT)
    .sort({ start_date: 1 })
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        packages.map(normalizeMedia),
        `${
          tripType.charAt(0).toUpperCase() + tripType.slice(1)
        } packages retrieved successfully`
      )
    );
});
