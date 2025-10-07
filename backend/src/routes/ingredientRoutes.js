import { Router } from "express";
import {
  listIngredients,
  getIngredient,
  createIngredient,
  updateIngredient,
  deleteIngredient
} from "../controllers/ingredientController.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

// Public reads
router.get("/", listIngredients);         // GET /api/ingredients
router.get("/:id", getIngredient);        // GET /api/ingredients/:id

// Admin writes
router.post("/", authenticate, requireRole("admin"), createIngredient);         // POST /api/ingredients
router.patch("/:id", authenticate, requireRole("admin"), updateIngredient);     // PATCH /api/ingredients/:id
router.delete("/:id", authenticate, requireRole("admin"), deleteIngredient);    // DELETE /api/ingredients/:id

export default router;
