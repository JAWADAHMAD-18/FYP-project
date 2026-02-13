import jwt from "jsonwebtoken";
import User from "../models/users.models.js";
import NodeCache from "node-cache";

// Cache user data for 5 minutes to reduce DB queries
const userCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Access token missing"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Check cache first
    const cacheKey = `user:${decoded.id}`;
    let cachedUser = userCache.get(cacheKey);

    if (cachedUser) {
      socket.user = cachedUser;
      return next();
    }

    // Fetch from database if not in cache
    const user = await User.findById(decoded.id).select("_id isAdmin");

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = {
      id: user._id.toString(),
      isAdmin: user.isAdmin,
    };

    // Cache the user data
    userCache.set(cacheKey, socket.user);

    next();
  } catch (error) {
    // Sanitize error messages in production
    const errorMessage = process.env.NODE_ENV === "production"
      ? "Invalid or expired access token"
      : error.message || "Invalid or expired access token";
    return next(new Error(errorMessage));
  }
};
