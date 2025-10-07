import { Router } from "express";
import { register, login, me } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";


const router = Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me  (will require auth middleware later; will 401 for now)
router.get("/me", authenticate, me);

export default router;
