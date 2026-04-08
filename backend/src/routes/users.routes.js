import { Router } from "express";
import { registerUser, loginUser, refreshAccessToken, logoutUser, getCurrentUser, updateUserProfile } from "../controllers/users.controllers.js";
import { forgotPassword, resetPassword } from "../controllers/auth.controllers.js";
import { upload } from "../middleware/cloudinary.middleware.js";
import verifyAuth from "../middleware/auth.middleware.js";
import { authLimiter, apiLimiter, strictLimiter } from "../utills/rateLimiter.utills.js";

const router = Router();

// Public routes — auth endpoints are high-value targets (brute-force, credential stuffing).
// authLimiter: 5 req / 15 min (production), 50 req / 15 min (development).
router.route("/register").post(authLimiter, upload.single("profilePic"), registerUser);
router.route("/login").post(authLimiter, loginUser);
router.route("/refresh-token").post(authLimiter, refreshAccessToken);
router.route("/auth/forgot-password").post(strictLimiter, forgotPassword);
router.route("/auth/reset-password").post(strictLimiter, resetPassword);

// Protected routes — lighter general limiter is sufficient here.
router.route("/logout").post(apiLimiter, verifyAuth, logoutUser);
router.route("/me").get(apiLimiter, verifyAuth, getCurrentUser);
router.route("/profile-update").patch(apiLimiter, verifyAuth, upload.single("profilePic"), updateUserProfile);

export default router;
