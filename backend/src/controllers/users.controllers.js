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

  // Fetch created user without password
  const createdUser = await User.findOne({ email }).select("-password");
  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, "User created successfully", { user: createdUser })
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
  // Try cookie first, then body
  console.log("Refresh token from cookie:", req.cookies.refreshToken);

  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!refreshToken) throw new ApiError(401, "No refresh token provided");
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
  const user = await User.findById(decoded._id); //here i canged id to _id
  if (!user) throw new ApiError(404, "User not found");
  if (!user.refreshToken || user.refreshToken !== refreshToken) {
    throw new ApiError(401, "Refresh token revoked or does not match");
  }
  const accessToken = await user.generateAccessToken();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  res.cookie("refreshToken", refreshToken, cookieOptions);

  return res.status(200).json(
    new ApiResponse(200, "Access token refreshed successfully", {
      accessToken,
    })
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
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };
  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, "User logged out successfully"));
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
