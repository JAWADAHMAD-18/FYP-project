//to check if the user is admin or not
import { ApiError } from "../utills/apiError.utills.js";
import asyncHandler from "../utills/asynchandler.utills.js";
import User from "../models/users.models.js";

export const isAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) throw new ApiError(401, "Unauthorized request");

  if (!req.user.isAdmin)
    throw new ApiError(403, "Access denied: Admins only");

  next();
});
