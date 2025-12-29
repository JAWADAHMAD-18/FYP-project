import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("_id role");

    if (!user) {
      return next(new Error("User not found"));
    }

    // attach session data
    socket.user = {
      id: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (err) {
    next(new Error("Invalid or expired token"));
  }
};
