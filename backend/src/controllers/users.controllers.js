import { ApiError } from "../utills/apiError.utills.js";
import { ApiResponse } from "../utills/apiResponse.utills.js";
import asyncHandler from "../utills/asynchandler.utills.js";
import User from "../models/users.models.js";
import cloudinaryImageUpload from "../utills/cloudinary.utills.js";

export const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log("generate access and refresh token error", error);
    throw new ApiError(500, "Something went wrong during token generation ");
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  //TODO: make All fields required in frontend
  if (!name || !email || !password || !phone) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(400, "User already exists");
  }
  const fileLocalPath = req.file?.path;

  if (!fileLocalPath) {
    throw new ApiError(400, "Profile pic is required");
  }
  const imageUpload = await cloudinaryImageUpload(fileLocalPath);
  if (!imageUpload) {
    throw new ApiError(
      400,
      "Failed to upload profile pic on cloudinary in controllers"
    );
  }
  const user = await User.create({
    name,
    email,
    password,
    phone,
    profilePic: imageUpload.url,
  });
  const createdUser = await User.findOne({ email }).select("-password");
  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully"));
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
  return res.status(200).json(
    new ApiResponse(200, "User logged in successfully", {
      user: loggedUser,
      accessToken,
      refreshToken,
    })
  );
});
