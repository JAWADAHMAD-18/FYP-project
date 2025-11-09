import { Router } from "express";
import { registerUser, loginUser, refreshAccessToken } from "../controllers/users.controllers.js";
import { upload } from "../middleware/cloudinary.middleware.js";

const router = Router();

// Routes for users
router.route("/register").post (upload.single("profilePic"), registerUser);
router.route("/login").post(loginUser)
router.route("/refresh-token").post( refreshAccessToken);

export default router;