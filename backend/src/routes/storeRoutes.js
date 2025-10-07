import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createStore,
  listStores,
  updateStore,
  deleteStore,
} from "../controllers/storeController.js";

const router = Router();

// Public list
router.get("/", listStores);

// Admin actions
router.post("/", authenticate, createStore);
router.patch("/:id", authenticate, updateStore);
router.delete("/:id", authenticate, deleteStore);

export default router;
