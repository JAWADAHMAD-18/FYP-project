import { ApiError } from "../utills/apiError.utills";
import asyncHandler from "../utills/asynchandler.utills";
import User from "../models/users.models";
import jwt from "jsonwebtoken";

// auth middleware for logged in users
const verifyAuth = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers("Authorization")?.replace("Bearer ", "");
    if (!token) throw new ApiError(401, "You are not logged in");
    const decoded = jwt.verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select(
      "-password",
      "-refreshToken"
    );
    if (!user) throw new ApiError(401, "User not authorized");
    req.user = user;
    next();
  } catch (error) {
    console.log("auth middleware error", error);
    throw new ApiError(401, "You are not logged in or token is invalid");
  }
});
