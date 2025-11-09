import { ApiError } from "../utills/apiError.utills.js";
import { ApiResponse } from "../utills/apiResponse.utills.js";
import asyncHandler from "../utills/asynchandler.utills.js";
import User from "../models/users.models.js";
import cloudinaryImageUpload from "../utills/cloudinary.utills.js";

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
