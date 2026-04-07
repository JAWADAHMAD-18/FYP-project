import { Router } from "express";
import { upload } from "../middleware/cloudinary.middleware.js";
import { 
	addPackage,
	updatePackage,
	deletePackage
} from "../controllers/admin.controllers.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import verifyAuth from "../middleware/auth.middleware.js";
import { apiLimiter } from "../utills/rateLimiter.utills.js";

const router = Router();

// Protect all routes with auth and admin middleware
router.use(verifyAuth, isAdmin);

// Package management routes
router.route("/add-package")
	.post(apiLimiter, upload.single("image"), addPackage);

router.route("/package/:packageId")
	.patch(apiLimiter, upload.single("image"), updatePackage)
	.delete(apiLimiter, deletePackage);

export default router;
