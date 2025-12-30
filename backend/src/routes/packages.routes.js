import { Router } from "express";
import {
  getPackage,
  getAllPackages,
  getActivePackages,
  getPackagesByType
} from "../controllers/package.controllers.js";

const router = Router();

// Public package routes (no auth required)
router.get("/packages", getAllPackages);
router.get("/packages/active", getActivePackages);
router.get("/packages/type/:tripType", getPackagesByType);
router.get("/packages/:packageId", getPackage);

export default router;