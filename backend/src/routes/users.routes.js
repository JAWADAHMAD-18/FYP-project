import { Router } from "express";
import { registerUser, loginUser, refreshAccessToken, logoutUser, getCurrentUser } from "../controllers/users.controllers.js";
import { upload } from "../middleware/cloudinary.middleware.js";
import verifyAuth from "../middleware/auth.middleware.js";

const router = Router();

// Public routes (no auth required)
router.route("/register").post (upload.single("profilePic"), registerUser);
router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes (auth required - req.user populated by verifyAuth)
router.route("/logout").post(verifyAuth, logoutUser);
router.route("/me").get( getCurrentUser);// Todo:add the middleware to check if the user is logged in

export default router;