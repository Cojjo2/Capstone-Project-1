import { Router } from "express";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

// Public reads
router.get("/", listProducts);          // GET /api/products
router.get("/:id", getProduct);         // GET /api/products/:id

// Admin writes
router.post("/", authenticate, requireRole("admin"), createProduct);        // POST /api/products
router.patch("/:id", authenticate, requireRole("admin"), updateProduct);    // PATCH /api/products/:id
router.delete("/:id", authenticate, requireRole("admin"), deleteProduct);   // DELETE /api/products/:id

export default router;
