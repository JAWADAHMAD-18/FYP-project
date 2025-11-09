import { Router } from "express";
import { registerUser } from "../controllers/users.controllers.js";
import { upload } from "../middleware/cloudinary.middleware.js";

const router = Router();

// Routes for users
router.post("/register", upload.single("profilePic"), registerUser);

export default router;