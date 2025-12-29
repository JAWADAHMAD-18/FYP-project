import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Access token missing"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.id).select("_id isAdmin");

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = {
      id: user._id.toString(),
      isAdmin: user.isAdmin,
    };

    next();
  } catch (error) {
    return next(new Error("Invalid or expired access token"));
  }
};
