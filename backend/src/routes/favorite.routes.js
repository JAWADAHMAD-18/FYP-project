import { Router } from "express";
import {
  addToFavorite,
  getUserFavorites,
  removeFromFavorite,
  getFavoriteCount
} from "../controllers/favorite.controller.js";
import verifyAuth from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", verifyAuth,getUserFavorites);

router.post("/add-favorite",verifyAuth ,addToFavorite);

router.delete("/:packageId", verifyAuth,removeFromFavorite);
router.get("/count", verifyAuth, getFavoriteCount);


export default router;
