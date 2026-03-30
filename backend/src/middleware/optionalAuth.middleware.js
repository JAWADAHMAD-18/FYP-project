import User from "../models/users.models.js";
import jwt from "jsonwebtoken";

// Non-blocking auth middleware — never throws, never returns an error response.
// If a valid Bearer token is present, attaches the user to req.user.
// If token is absent, invalid, or expired, silently continues as a guest.
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(); // No token — continue as guest
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.id).select(
      "-password -refreshToken"
    );

    if (user) {
      req.user = user; // Attach only when user exists in DB
    }
  } catch {
    // Token invalid or expired — silently continue as guest
  }

  next();
};

export default optionalAuth;
