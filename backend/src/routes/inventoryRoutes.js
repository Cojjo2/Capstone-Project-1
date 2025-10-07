import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createInventory,
  listInventory,
  updateInventory,
  deleteInventory,
} from "../controllers/inventoryController.js";

const router = Router();

// Public read
router.get("/", listInventory);

// Admin write
router.post("/", authenticate, createInventory);
router.patch("/:id", authenticate, updateInventory);
router.delete("/:id", authenticate, deleteInventory);

export default router;
