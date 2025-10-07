import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  addFavorite,
  listFavorites,
  deleteFavorite,
} from "../controllers/favoriteController.js";

const router = Router();

// Auth required for all favorite actions
router.post("/", authenticate, addFavorite);          // POST /api/favorites
router.get("/", authenticate, listFavorites);         // GET /api/favorites
router.delete("/:id", authenticate, deleteFavorite);  // DELETE /api/favorites/:id

export default router;
