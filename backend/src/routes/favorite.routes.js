import { Router } from "express";
import {
  addToFavorite,
  getUserFavorites,
  removeFromFavorite,
  getFavoriteCount
} from "../controllers/favorite.controller.js";
import verifyAuth from "../middleware/auth.middleware.js";
import { apiLimiter } from "../utills/rateLimiter.utills.js";

const router = Router();

// Favorite routes hit the DB for user-specific data — apiLimiter is sufficient.
router.get("/", apiLimiter, verifyAuth, getUserFavorites);
router.post("/add-favorite", apiLimiter, verifyAuth, addToFavorite);
router.delete("/:packageId", apiLimiter, verifyAuth, removeFromFavorite);
router.get("/count", apiLimiter, verifyAuth, getFavoriteCount);

export default router;
