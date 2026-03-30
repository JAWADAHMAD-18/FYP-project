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

// Helper: returns true if a package is active (available=true AND start_date >= today)
const isPackageActive = (pkg, today) => {
  return pkg.available === true && new Date(pkg.start_date) >= today;
};

// Helper: JS-level sort for admin — active packages first, expired at bottom,
// secondary sort by start_date ascending within each group.
const adminSort = (packages, today) => {
  return [...packages].sort((a, b) => {
    const aActive = isPackageActive(a, today);
    const bActive = isPackageActive(b, today);
    if (aActive && !bActive) return -1;
    if (!bActive && aActive) return 1;
    return new Date(a.start_date) - new Date(b.start_date);
  });
};

// Get a single package by ID
export const getPackage = asyncHandler(async (req, res) => {
  const { packageId } = req.params;
  const isAdmin = req.user?.isAdmin === true;
  const cacheKey = isAdmin
    ? generateKey("package:details:admin", packageId)
    : generateKey("package:details:user", packageId);

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

  // Guest/user: hide expired or unavailable packages entirely (return 404 so
  // existence is not revealed)
  if (!isAdmin) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!isPackageActive(packageData, today)) {
      throw new ApiError(404, "Package not found");
    }
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
  const isAdmin = req.user?.isAdmin === true;
  const cacheKey = isAdmin ? "packages:all:admin" : "packages:all:user";

  const cached = await getCache(cacheKey);
  if (cached) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, cached, "Packages retrieved successfully (cache)")
      );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let packages;

  if (isAdmin) {
    // Admin: fetch ALL packages, then JS-sort active on top, expired at bottom
    const all = await Package.find()
      .select(PUBLIC_PACKAGE_SELECT)
      .lean();

    packages = adminSort(all, today);
  } else {
    // Guest / regular user: only active future packages
    packages = await Package.find({
      available: true,
      start_date: { $gte: today },
    })
      .select(PUBLIC_PACKAGE_SELECT)
      .sort({ start_date: 1 })
      .lean();
  }

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

// Get active packages (available=true and start_date >= today)
export const getActivePackages = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.isAdmin === true;
  const cacheKey = isAdmin
    ? "packages:active:admin"
    : "packages:active:user";

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let data;

  if (isAdmin) {
    // Admin: fetch ALL, sort active on top, expired at bottom
    const all = await Package.find()
      .select(PUBLIC_PACKAGE_SELECT)
      .lean();

    data = adminSort(all, today).map(normalizeMedia);
  } else {
    // Guest / regular user: only available + future start_date
    const packages = await Package.find({
      available: true,
      start_date: { $gte: today },
    })
      .select(PUBLIC_PACKAGE_SELECT)
      .sort({ start_date: 1 })
      .lean();

    data = packages.map(normalizeMedia);
  }

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

  const isAdmin = req.user?.isAdmin === true;
  const cacheKey = isAdmin
    ? generateKey(`packages:type:${tripType}`, "admin")
    : generateKey(`packages:type:${tripType}`, "user");

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let data;

  if (isAdmin) {
    // Admin: fetch all packages of this trip type, sort active on top
    const all = await Package.find({ trip_type: tripType })
      .select(PUBLIC_PACKAGE_SELECT)
      .lean();

    data = adminSort(all, today).map(normalizeMedia);
  } else {
    // Guest / regular user: only available + future start_date for this trip type
    const packages = await Package.find({
      trip_type: tripType,
      available: true,
      start_date: { $gte: today },
    })
      .select(PUBLIC_PACKAGE_SELECT)
      .sort({ start_date: 1 })
      .lean();

    data = packages.map(normalizeMedia);
  }

  // Cache for 10 minutes
  await setCache(cacheKey, data, 600);

  return res
    .status(200)
    .json(
      new ApiResponse(200, data, `${tripType} packages retrieved successfully`)
    );
});
