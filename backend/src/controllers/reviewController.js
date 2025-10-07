import Review from "../models/Review.js";

/** Standard error shape helper (matches your API spec) */
const errorResponse = (res, status, message, code = "SERVER_ERROR", details = {}) => {
  return res.status(status).json({ error: { message, code, details } });
};

/** Helpers: pagination & sorting */
const parseIntOr = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : d;
};

const buildSort = (sortParam) => {
  if (!sortParam) return { createdAt: -1 };
  if (sortParam.startsWith("-")) return { [sortParam.slice(1)]: -1 };
  return { [sortParam]: 1 };
};

/** GET /api/reviews — public
 * Query: productId, userId (either or both), page, limit, sort
 */
export const listReviews = async (req, res) => {
  try {
    const page = parseIntOr(req.query.page, 1);
    const limit = Math.min(parseIntOr(req.query.limit, 20), 100);
    const sort = buildSort(req.query.sort);

    const filter = {};
    if (req.query.productId) filter.productId = req.query.productId;
    if (req.query.userId) filter.userId = req.query.userId;

    const [total, items] = await Promise.all([
      Review.countDocuments(filter),
      Review.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    ]);

    return res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      items,
    });
  } catch (err) {
    console.error("listReviews error:", err);
    return errorResponse(res, 500, "Unable to list reviews.", "SERVER_ERROR");
  }
};

/** GET /api/reviews/:id — public (single review by ID) */
export const getReview = async (req, res) => {
  try {
    const rev = await Review.findById(req.params.id);
    if (!rev) {
      return errorResponse(res, 404, "Review not found.", "NOT_FOUND");
    }
    return res.json(rev);
  } catch (err) {
    console.error("getReview error:", err);
    return errorResponse(res, 500, "Unable to get review.", "SERVER_ERROR");
  }
};

/** ✅ NEW: GET /api/reviews/product/:productId — all reviews for a product */
export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId });
    if (!reviews.length) {
      return errorResponse(res, 404, "Review not found.", "NOT_FOUND");
    }
    return res.json(reviews);
  } catch (err) {
    console.error("getReviewsByProduct error:", err);
    return errorResponse(res, 500, "Unable to list product reviews.", "SERVER_ERROR");
  }
};

/** POST /api/reviews — auth required
 * Body: { productId: string, rating: 1-5, comment?: string }
 * Enforces 1 review per user per product via unique index.
 */
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body || {};
    if (!productId) {
      return errorResponse(res, 400, "productId is required.", "VALIDATION_ERROR", { field: "productId" });
    }
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return errorResponse(res, 400, "rating must be an integer 1–5.", "VALIDATION_ERROR", { field: "rating" });
    }

    const rev = await Review.create({
      userId: req.user.id,
      productId,
      rating: Math.round(r),
      comment: comment?.trim() || "",
    });

    return res.status(201).json(rev);
  } catch (err) {
    if (err?.code === 11000) {
      // duplicate (userId + productId)
      return errorResponse(res, 409, "You have already reviewed this product.", "CONFLICT");
    }
    console.error("createReview error:", err);
    return errorResponse(res, 500, "Unable to create review.", "SERVER_ERROR");
  }
};

/** PATCH /api/reviews/:id — owner or admin */
export const updateReview = async (req, res) => {
  try {
    const rev = await Review.findById(req.params.id);
    if (!rev) {
      return errorResponse(res, 404, "Review not found.", "NOT_FOUND");
    }
    // Only owner or admin
    if (req.user.role !== "admin" && rev.userId.toString() !== req.user.id) {
      return errorResponse(res, 403, "Forbidden.", "FORBIDDEN");
    }

    const allowed = ["rating", "comment"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (key === "rating") {
          const r = Number(req.body.rating);
          if (!Number.isFinite(r) || r < 1 || r > 5) {
            return errorResponse(res, 400, "rating must be 1–5.", "VALIDATION_ERROR", { field: "rating" });
          }
          rev.rating = Math.round(r);
        } else if (key === "comment") {
          rev.comment = String(req.body.comment ?? "").trim();
        }
      }
    }

    await rev.save();
    return res.json(rev);
  } catch (err) {
    console.error("updateReview error:", err);
    return errorResponse(res, 500, "Unable to update review.", "SERVER_ERROR");
  }
};

/** DELETE /api/reviews/:id — owner or admin */
export const deleteReview = async (req, res) => {
  try {
    const rev = await Review.findById(req.params.id);
    if (!rev) {
      return errorResponse(res, 404, "Review not found.", "NOT_FOUND");
    }
    if (req.user.role !== "admin" && rev.userId.toString() !== req.user.id) {
      return errorResponse(res, 403, "Forbidden.", "FORBIDDEN");
    }

    await Review.findByIdAndDelete(req.params.id);
    return res.status(204).send();
  } catch (err) {
    console.error("deleteReview error:", err);
    return errorResponse(res, 500, "Unable to delete review.", "SERVER_ERROR");
  }
};
