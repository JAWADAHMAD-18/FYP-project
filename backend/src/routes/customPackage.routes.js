import { Router } from "express";
import verifyAuth from "../middleware/auth.middleware.js";
import {
  createCustomPackage as generateCustomPackagePreview,
  confirmCustomPackageController,
  // getCustomPackageById,
  // getUserCustomPackages,
  // deleteCustomPackage,
} from "../controllers/customPackage.controllers.js";

const router = Router();

// Preview: generate AI-powered custom package preview (no persistence)
router.post("/preview", verifyAuth, generateCustomPackagePreview);

// Confirm: persist a confirmed custom package
router.post("/confirm", verifyAuth, confirmCustomPackageController);

// Get a single saved custom package by ID
// router.get("/:id", verifyAuth, getCustomPackageById);

// Get all custom packages for the authenticated user
// router.get("/user/my-packages", verifyAuth, getUserCustomPackages);

// Delete a custom package owned by the authenticated user
// router.delete("/:id", verifyAuth, deleteCustomPackage);

export default router;
