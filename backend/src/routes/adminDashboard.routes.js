import { Router } from "express";
import verifyAuth from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { getDashboardSummary } from "../controllers/adminDashboardSummary.controllers.js";
import { dbQueryLimiter } from "../utills/rateLimiter.utills.js";

const router = Router();

// Protect all dashboard routes with auth + admin check
router.use(verifyAuth, isAdmin);

// GET /api/v1/admin/dashboard/summary
// Dashboard summary performs extensive aggregations across bookings, users, and packages
router.route("/summary").get(dbQueryLimiter, getDashboardSummary);

export default router;
