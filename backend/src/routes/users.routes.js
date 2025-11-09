import { Router } from "express";
import { registerUser,loginUser } from "../controllers/users.controllers.js";
import { upload } from "../middleware/cloudinary.middleware.js";

const router = Router();

// Routes for users
router.post("/register", upload.single("profilePic"), registerUser);
router.route("/login").post(loginUser)

export default router;