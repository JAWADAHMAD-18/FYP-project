import { Router } from "express";
import rateLimit from "express-rate-limit";
import { registerUser, loginUser, refreshAccessToken, logoutUser, getCurrentUser, updateUserProfile } from "../controllers/users.controllers.js";
import { upload } from "../middleware/cloudinary.middleware.js";
import verifyAuth from "../middleware/auth.middleware.js";

const router = Router();

// Rate limiter: 10 requests per 15 minutes for sensitive auth endpoints
const authLimiter = rateLimit({
  // windowMs: 15 * 60 * 1000,
  // max: 10,
  // message: { success: false, message: "Too many requests, please try again after 15 minutes." },
  // standardHeaders: true,
  // legacyHeaders: false,
});

// Public routes (no auth required)
router.route("/register").post(authLimiter, upload.single("profilePic"), registerUser);
router.route("/login").post(authLimiter, loginUser);
router.route("/refresh-token").post(authLimiter, refreshAccessToken);

// Protected routes (auth required - req.user populated by verifyAuth)
router.route("/logout").post(verifyAuth, logoutUser);
router.route("/me").get(verifyAuth, getCurrentUser);
router.route("/profile-update").patch(verifyAuth, upload.single("profilePic"), updateUserProfile);

export default router;
