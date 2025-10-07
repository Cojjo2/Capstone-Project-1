import Product from "../models/Product.js";

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

/** GET /api/products — public, paginated
 * Filters (from your spec):
 *  - brandId
 *  - ingredientId (matches products that CONTAIN this ingredient)
 * (storeId will be supported later via Inventory)
 */
export const listProducts = async (req, res) => {
  try {
    const page = parseIntOr(req.query.page, 1);
    const limit = Math.min(parseIntOr(req.query.limit, 20), 100);
    const sort = buildSort(req.query.sort);

    const filter = { isActive: true };

    if (req.query.brandId) filter.brandId = req.query.brandId;
    if (req.query.ingredientId) filter.ingredients = req.query.ingredientId;

    const [total, items] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    return res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      items,
    });
  } catch (err) {
    console.error("listProducts error:", err);
    return errorResponse(res, 500, "Unable to list products.", "SERVER_ERROR");
  }
};

/** GET /api/products/:id — public */
export const getProduct = async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod || !prod.isActive) {
      return errorResponse(res, 404, "Product not found.", "NOT_FOUND");
    }
    return res.json(prod);
  } catch (err) {
    console.error("getProduct error:", err);
    return errorResponse(res, 500, "Unable to get product.", "SERVER_ERROR");
  }
};

/** POST /api/products — admin only */
export const createProduct = async (req, res) => {
  try {
    const { name, brandId, ingredients, imageUrl, description } = req.body || {};

    if (!name || !name.trim()) {
      return errorResponse(res, 400, "Name is required.", "VALIDATION_ERROR", { field: "name" });
    }
    if (!brandId) {
      return errorResponse(res, 400, "brandId is required.", "VALIDATION_ERROR", { field: "brandId" });
    }

    const prod = await Product.create({
      name: name.trim(),
      brandId,
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      imageUrl: imageUrl?.trim() || "",
      description: description?.trim() || "",
    });

    return res.status(201).json(prod);
  } catch (err) {
    console.error("createProduct error:", err);
    return errorResponse(res, 500, "Unable to create product.", "SERVER_ERROR");
  }
};

/** PATCH /api/products/:id — admin only */
export const updateProduct = async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod || !prod.isActive) {
      return errorResponse(res, 404, "Product not found.", "NOT_FOUND");
    }

    const allowed = ["name", "brandId", "ingredients", "imageUrl", "description", "isActive"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        prod[key] = req.body[key];
      }
    }

    await prod.save();
    return res.json(prod);
  } catch (err) {
    console.error("updateProduct error:", err);
    return errorResponse(res, 500, "Unable to update product.", "SERVER_ERROR");
  }
};

/** DELETE /api/products/:id — admin only (hard delete per spec) */
export const deleteProduct = async (req, res) => {
  try {
    const prod = await Product.findByIdAndDelete(req.params.id);
    if (!prod) {
      return errorResponse(res, 404, "Product not found.", "NOT_FOUND");
    }
    return res.status(204).send();
  } catch (err) {
    console.error("deleteProduct error:", err);
    return errorResponse(res, 500, "Unable to delete product.", "SERVER_ERROR");
  }
};
