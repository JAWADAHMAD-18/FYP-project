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
import {
  customPackageLimiter,
  apiLimiter,
} from "../utills/rateLimiter.utills.js";

const router = Router();

// Preview + Confirm trigger Amadeus (flights & hotels), OpenWeather, Unsplash, and Gemini
// in a single request — each generation consumes multiple external API quotas.
// customPackageLimiter: 10 req / 10 min (production).
router.post("/preview", customPackageLimiter, verifyAuth, generateCustomPackagePreview);
router.post("/confirm", customPackageLimiter, verifyAuth, confirmCustomPackageController);

// Status transition is a lightweight DB update — general apiLimiter is sufficient.
router.patch("/status/negotiating", apiLimiter, verifyAuth, setCustomPackageNegotiating);

// Admin routes: DB lookups and partial updates — apiLimiter is fine.
router.get(
  "/admin/custom-package/:requestId",
  apiLimiter,
  verifyAuth,
  adminGetCustomPackageByRequestId
);

router.patch(
  "/admin/custom-package/:requestId/status",
  apiLimiter,
  verifyAuth,
  adminSetCustomPackageStatus
);

router.patch(
  "/admin/custom-package/:requestId/admin-update",
  apiLimiter,
  verifyAuth,
  adminPartialUpdateCustomPackage
);

// Commented-out user self-service routes (preserved for future use):
// router.get("/:id", verifyAuth, getCustomPackageById);
// router.get("/user/my-packages", verifyAuth, getUserCustomPackages);
// router.delete("/:id", verifyAuth, deleteCustomPackage);

export default router;
