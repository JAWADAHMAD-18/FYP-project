import asyncHandler from "../utills/asynchandler.utills.js";
import Package from "../models/packages.models.js";
import Favorite from "../models/favorite.models.js";
import { ApiError } from "../utills/apiError.utills.js";
import { ApiResponse } from "../utills/apiResponse.utills.js";
import {
  generateKey,
  getCache,
  setCache,
  deleteCache,
} from "../utills/localRedis.utills.js";

export const addToFavorite = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { packageId } = req.body;

  if (!packageId) {
    throw new ApiError(400, "Package ID is required");
  }

  const packageData = await Package.findById(packageId).lean();

  if (!packageData) {
    throw new ApiError(404, "Package not found");
  }

  try {
    await Favorite.create({
      user: userId,
      package: packageId,
      snapshot: {
        title: packageData.title,
        price: packageData.price,
        image: packageData.image,
        location: packageData.location,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(400, "Already added to favorites");
    }
    throw error;
  }

  // Invalidate user's favorites cache
  const cacheKey = generateKey("user:favorites", userId.toString());
  await deleteCache(cacheKey);

  return res
    .status(201)
    .json(new ApiResponse(201, null, "Added to favorites successfully"));
});

export const getUserFavorites = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cacheKey = generateKey("user:favorites", userId.toString());

  // Check cache
  const cached = await getCache(cacheKey);
  if (cached) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, cached, "Favorites retrieved successfully (cache)")
      );
  }

  const favorites = await Favorite.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();

  // Save to cache (10 minutes — shorter than package details)
  await setCache(cacheKey, favorites, 600);

  return res
    .status(200)
    .json(new ApiResponse(200, favorites, "Favorites retrieved successfully"));
});

export const removeFromFavorite = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { packageId } = req.params;

  const deleted = await Favorite.findOneAndDelete({
    user: userId,
    package: packageId,
  });

  if (!deleted) {
    throw new ApiError(404, "Favorite not found");
  }

  // Invalidate cache
  const cacheKey = generateKey("user:favorites", userId.toString());
  await deleteCache(cacheKey);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Removed from favorites successfully"));
});
export const getFavoriteCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const count = await Favorite.countDocuments({ user: userId });

  return res
    .status(200)
    .json(new ApiResponse(200, count, "Favorite count retrieved successfully"));
});
