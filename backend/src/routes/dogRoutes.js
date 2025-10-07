import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  listDogs,
  getDog,
  createDog,
  updateDog,
  deleteDog
} from "../controllers/dogController.js";

const router = Router();

// All dog endpoints require auth per your API spec
router.get("/", authenticate, listDogs);        // GET /api/dogs
router.get("/:id", authenticate, getDog);       // GET /api/dogs/:id
router.post("/", authenticate, createDog);      // POST /api/dogs
router.patch("/:id", authenticate, updateDog);  // PATCH /api/dogs/:id
router.delete("/:id", authenticate, deleteDog); // DELETE /api/dogs/:id

export default router;
