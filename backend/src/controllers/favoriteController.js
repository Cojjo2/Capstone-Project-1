import Favorite from "../models/Favorite.js";
import Product from "../models/Product.js";

/** Standard error helper */
const errorResponse = (
  res,
  status,
  message,
  code = "SERVER_ERROR",
  details = {}
) => {
  return res.status(status).json({ error: { message, code, details } });
};

/** POST /api/favorites — add a product to favorites (auth required) */
export const addFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return errorResponse(
        res,
        400,
        "productId is required.",
        "VALIDATION_ERROR"
      );
    }

    // verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse(res, 404, "Product not found.", "NOT_FOUND");
    }

    const favorite = await Favorite.create({
      userId: req.user.id,
      productId,
    });

    return res.status(201).json(favorite);
  } catch (err) {
    if (err.code === 11000) {
      return errorResponse(
        res,
        409,
        "Product already in favorites.",
        "CONFLICT"
      );
    }
    console.error("addFavorite error:", err);
    return errorResponse(res, 500, "Unable to add favorite.", "SERVER_ERROR");
  }
};

/** GET /api/favorites — list current user’s favorites (auth required) */
export const listFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id }).populate(
      "productId"
    );
    return res.json(favorites);
  } catch (err) {
    console.error("listFavorites error:", err);
    return errorResponse(res, 500, "Unable to list favorites.", "SERVER_ERROR");
  }
};

/** DELETE /api/favorites/:id — remove from favorites (auth required) */
export const deleteFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findById(req.params.id);
    if (!favorite) {
      return errorResponse(res, 404, "Favorite not found.", "NOT_FOUND");
    }
    if (favorite.userId.toString() !== req.user.id) {
      return errorResponse(res, 403, "Forbidden.", "FORBIDDEN");
    }

    await favorite.deleteOne();
    return res.status(204).send();
  } catch (err) {
    console.error("deleteFavorite error:", err);
    return errorResponse(
      res,
      500,
      "Unable to delete favorite.",
      "SERVER_ERROR"
    );
  }
};
