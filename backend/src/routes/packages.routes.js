import { Router } from "express";
import {
  getPackage,
  getAllPackages,
  getActivePackages,
  getPackagesByType,
} from "../controllers/package.controllers.js";
import optionalAuth from "../middleware/optionalAuth.middleware.js";

const router = Router();

// Public package routes — no auth required, but optionalAuth attaches req.user
// when a valid token is present so controllers can apply role-aware responses.
router.get("/packages", optionalAuth, getAllPackages);
router.get("/packages/active", optionalAuth, getActivePackages);
router.get("/packages/type/:tripType", optionalAuth, getPackagesByType);
router.get("/packages/:packageId", optionalAuth, getPackage);

export default router;