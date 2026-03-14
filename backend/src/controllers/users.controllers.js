import { ApiError } from "../utills/apiError.utills.js";
import { ApiResponse } from "../utills/apiResponse.utills.js";
import asyncHandler from "../utills/asynchandler.utills.js";
import User from "../models/users.models.js";
import cloudinaryImageUpload from "../utills/cloudinary.utills.js";
import jwt from "jsonwebtoken";

export const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    const accessToken =await  user.generateAccessToken();
    const refreshToken =await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log("generate access and refresh token error", error);
    throw new ApiError(500, "Something went wrong during token generation ");
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  // Check if user already exists
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(400, "User already exists");
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Auto-login: generate tokens immediately after registration
  const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id);

  // Fetch created user without sensitive fields
  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  res.cookie("refreshToken", refreshToken, cookieOptions);

  return res.status(201).json(
    new ApiResponse(201, { user: createdUser, accessToken }, "User registered successfully")
  );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(400, "User not found");
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) throw new ApiError(400, "Invalid password ");
  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id
  );
  const loggedUser = await User.findOne({ email }).select("-password");
  if (!loggedUser) throw new ApiError(500, "Failed to login user");

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    // Convert days to milliseconds (7d = 7 * 24 * 60 * 60 * 1000)
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  res.cookie("refreshToken", refreshToken, cookieOptions);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: loggedUser,
        accessToken,
      },
      "User logged in successfully"
    )
  );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  // Read refresh token from httpOnly cookie ONLY (no body fallback)
  const incomingRefreshToken = req.cookies?.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(401, "No refresh token provided");

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  // Use decoded.id — matches the payload field set in generateRefreshToken: { id: this._id }
  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(404, "User not found");

  if (!user.refreshToken || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token revoked or does not match");
  }

  // Rotate: generate brand-new refresh token and new access token
  const newRefreshToken = user.generateRefreshToken();
  const newAccessToken = await user.generateAccessToken();

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  res.cookie("refreshToken", newRefreshToken, cookieOptions);

  return res.status(200).json(
    new ApiResponse(200, { accessToken: newAccessToken }, "Access token refreshed successfully")
  );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  // Use matching cookie attributes to ensure the browser actually clears the cookie
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };
  return res
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  // req.user is populated by verifyAuth middleware
  if (!req.user) {
    throw new ApiError(401, "User not authenticated");
  }

  // Fetch fresh user data from DB to ensure latest info
  const user = await User.findById(req.user._id)
    .select("-password -refreshToken") // Exclude sensitive fields
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User data retrieved successfully", { user }));
});
