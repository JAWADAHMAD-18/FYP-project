import { ApiError } from "../utills/apiError.utills.js";
import asyncHandler from "../utills/asynchandler.utills.js";
import User from "../models/users.models.js";
import jwt from "jsonwebtoken";

// auth middleware for logged in users
const verifyAuth = asyncHandler(async (req, res, next) => {
  // try {
  //   const token =
  //     req.cookies?.accessToken ||
  //     req.headers?.authorization?.replace("Bearer ", "");
  //   if (!token) throw new ApiError(401, "You are not logged in");
  //   const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  //   const user = await User.findById(decoded.id).select("-password", "-refreshToken");
  //   if (!user) throw new ApiError(401, "User not authorized");
  //   req.user = user;
  //   next();
  // } catch (error) {
  //   console.log("auth middleware error", error);
  //   throw new ApiError(401, "You are not logged in or token is invalid");
  // }
});

export default verifyAuth;
