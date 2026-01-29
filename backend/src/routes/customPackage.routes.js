import { Router } from "express";
import { createCustomPackage } from "../controllers/customPackage.controllers.js";
import verifyAuth from "../middleware/auth.middleware.js";

const router = Router();

// Custom package creation route (requires auth)
router.post("/custom-package", verifyAuth, createCustomPackage);

export default router;
//TODO:also add ai to this custom packag controllers