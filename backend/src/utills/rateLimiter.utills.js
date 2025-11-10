import rateLimit from "express-rate-limit";
import { ApiError } from "./apiError.utills.js";

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new ApiError(429, "Too many requests, try again later");
  },
});

// Custom package creation limiter
export const customPackageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new ApiError(
      429,
      "Custom package limit reached (10/hr), try again later"
    );
  },
});

// External API call limiter
export const externalApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new ApiError(429, "External API rate limit reached, try again later");
  },
});
