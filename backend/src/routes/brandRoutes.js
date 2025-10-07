import { Router } from "express";
import {
  listBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand
} from "../controllers/brandController.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

// Public reads
router.get("/", listBrands);          // GET /api/brands
router.get("/:id", getBrand);         // GET /api/brands/:id

// Admin writes
router.post("/", authenticate, requireRole("admin"), createBrand);        // POST /api/brands
router.patch("/:id", authenticate, requireRole("admin"), updateBrand);    // PATCH /api/brands/:id
router.delete("/:id", authenticate, requireRole("admin"), deleteBrand);   // DELETE /api/brands/:id

export default router;
