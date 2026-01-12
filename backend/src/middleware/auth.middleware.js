import { ApiError } from "../utills/apiError.utills.js";
import asyncHandler from "../utills/asynchandler.utills.js";
import User from "../models/users.models.js";
import jwt from "jsonwebtoken";

const verifyAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "You are not logged in");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, "Token is invalid or expired");
  }

  // 2️⃣ Use correct decoded field
  const user = await User.findById(decoded.id).select(
    "-password -refreshToken"
  );
  if (!user) throw new ApiError(401, "User not authorized");

  // 3️⃣ Attach user to request
  req.user = user;
  next();
});

export default verifyAuth;
