import { Router } from "express";
import {
  getPackage,
  getAllPackages,
  getActivePackages,
  getPackagesByType,
} from "../controllers/package.controllers.js";
import optionalAuth from "../middleware/optionalAuth.middleware.js";
import { dbQueryLimiter, apiLimiter } from "../utills/rateLimiter.utills.js";

const router = Router();

// Public package routes — no auth required, but optionalAuth attaches req.user
// when a valid token is present so controllers can apply role-aware responses.

// List / filter routes perform heavier DB fan-out — use dbQueryLimiter.
router.get("/packages", dbQueryLimiter, optionalAuth, getAllPackages);
router.get("/packages/active", dbQueryLimiter, optionalAuth, getActivePackages);
router.get("/packages/type/:tripType", dbQueryLimiter, optionalAuth, getPackagesByType);

// Single package lookup is cheap (indexed by _id) — general apiLimiter is fine.
router.get("/packages/:packageId", apiLimiter, optionalAuth, getPackage);

export default router;