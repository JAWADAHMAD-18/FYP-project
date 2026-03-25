import { Router } from "express";
import verifyAuth from "../middleware/auth.middleware.js";
import {
  createCustomPackage as generateCustomPackagePreview,
  confirmCustomPackageController,
  setCustomPackageNegotiating,
  adminGetCustomPackageByRequestId,
  adminSetCustomPackageStatus,
  adminPartialUpdateCustomPackage,
} from "../controllers/customPackage.controllers.js";

const router = Router();

// Preview: generate AI-powered custom package preview (no persistence)
router.post("/preview", verifyAuth, generateCustomPackagePreview);

// Confirm: persist a confirmed custom package
router.post("/confirm", verifyAuth, confirmCustomPackageController);

// User: transition generated → negotiating
router.patch("/status/negotiating", verifyAuth, setCustomPackageNegotiating);

// Admin: get full package by requestId
router.get(
  "/admin/custom-package/:requestId",
  verifyAuth,
  adminGetCustomPackageByRequestId
);

// Admin: update status (finalized | cancelled)
router.patch(
  "/admin/custom-package/:requestId/status",
  verifyAuth,
  adminSetCustomPackageStatus
);

// Admin: partial update — adminFinalPrice, selectedFlights, selectedHotels only
router.patch(
  "/admin/custom-package/:requestId/admin-update",
  verifyAuth,
  adminPartialUpdateCustomPackage
);

// Get a single saved custom package by ID
// router.get("/:id", verifyAuth, getCustomPackageById);

// Get all custom packages for the authenticated user
// router.get("/user/my-packages", verifyAuth, getUserCustomPackages);

// Delete a custom package owned by the authenticated user
// router.delete("/:id", verifyAuth, deleteCustomPackage);

export default router;
