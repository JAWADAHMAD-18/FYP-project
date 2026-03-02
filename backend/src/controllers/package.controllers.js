import asyncHandler from "../utills/asynchandler.utills.js";
import Package from "../models/packages.models.js";
import { ApiError } from "../utills/apiError.utills.js";
import { ApiResponse } from "../utills/apiResponse.utills.js";
import {
  generateKey,
  getCache,
  setCache,
} from "../utills/localRedis.utills.js";

// Explicit public-safe fields (no internal IDs beyond _id, no secrets, no admin metadata)
const PUBLIC_PACKAGE_SELECT = [
  "title",
  "price",
  "description",
  "highlights",
  "duration",
  "durationDays",
  "durationNights",
  "category",
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
  const cacheKey = generateKey("package:details", packageId);

  // Check cache
  const cachedPackage = await getCache(cacheKey);
  if (cachedPackage) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          cachedPackage,
          "Package retrieved successfully (cache)"
        )
      );
  }

  const packageData = await Package.findById(packageId)
    .select(PUBLIC_PACKAGE_SELECT)
    .lean();

  if (!packageData) {
    throw new ApiError(404, "Package not found");
  }

  const normalized = normalizeMedia(packageData);

  //  Save to cache (1 hour)
  await setCache(cacheKey, normalized, 3600);

  return res
    .status(200)
    .json(new ApiResponse(200, normalized, "Package retrieved successfully"));
});

// Get all packages (no pagination)
export const getAllPackages = asyncHandler(async (req, res) => {
  const cacheKey = "packages:all";

  const cached = await getCache(cacheKey);
  if (cached) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, cached, "Packages retrieved successfully (cache)")
      );
  }

  const packages = await Package.find()
    .select(PUBLIC_PACKAGE_SELECT)
    .sort({ createdAt: -1 })
    .lean();

  const responseData = {
    packages: packages.map(normalizeMedia),
    total: packages.length,
  };

  // Cache for 15 minutes
  await setCache(cacheKey, responseData, 900);

  return res
    .status(200)
    .json(
      new ApiResponse(200, responseData, "Packages retrieved successfully")
    );
});

// Get active packages (available=true and end_date > now)
export const getActivePackages = asyncHandler(async (req, res) => {
  const cacheKey = "packages:active";

  const cached = await getCache(cacheKey);
  if (cached) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          cached,
          "Active packages retrieved successfully (cache)"
        )
      );
  }

  const currentDate = new Date();

  const packages = await Package.find({
    available: true,
    end_date: { $gt: currentDate },
  })
    .select(PUBLIC_PACKAGE_SELECT)
    .sort({ start_date: 1 })
    .lean();

  const data = packages.map(normalizeMedia);

  // Cache for 10 minutes
  await setCache(cacheKey, data, 600);

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Active packages retrieved successfully"));
});

// Get packages by trip type (domestic/international)
export const getPackagesByType = asyncHandler(async (req, res) => {
  const { tripType } = req.params;

  if (!["domestic", "international"].includes(tripType)) {
    throw new ApiError(
      400,
      "Invalid trip type. Must be 'domestic' or 'international'"
    );
  }

  const cacheKey = generateKey("packages:type", tripType);

  const cached = await getCache(cacheKey);
  if (cached) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          cached,
          `${tripType} packages retrieved successfully (cache)`
        )
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

  const data = packages.map(normalizeMedia);

  // Cache for 10 minutes
  await setCache(cacheKey, data, 600);

  return res
    .status(200)
    .json(
      new ApiResponse(200, data, `${tripType} packages retrieved successfully`)
    );
});
