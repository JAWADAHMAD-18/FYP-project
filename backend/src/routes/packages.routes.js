import { Router } from "express";
import verifyAuth from "../middleware/auth.middleware.js";
import {
  getPackage,
  getAllPackages,
  getActivePackages,
  getPackagesByType
} from "../controllers/admin.controllers.js";

const router = Router();
router.use(verifyAuth);

// Public package routes (no auth required)
router.get("/packages", getAllPackages);
router.get("/packages/active", getActivePackages);
router.get("/packages/type/:tripType", getPackagesByType);
router.get("/packages/:packageId", getPackage);

export default router;