import { Router } from "express";
import {
  listReviews,
  getReview,
  getReviewsByProduct,   // <-- added import
  createReview,
  updateReview,
  deleteReview
} from "../controllers/reviewController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Public reads
router.get("/", listReviews);                          // GET /api/reviews?productId=&userId=&page=&limit=
router.get("/:id", getReview);                         // GET /api/reviews/:id
router.get("/product/:productId", getReviewsByProduct); // GET /api/reviews/product/:productId  <-- added

// Auth required for write ops
router.post("/", authenticate, createReview);           // POST /api/reviews
router.patch("/:id", authenticate, updateReview);       // PATCH /api/reviews/:id
router.delete("/:id", authenticate, deleteReview);      // DELETE /api/reviews/:id

export default router;
