import Ingredient from "../models/Ingredient.js";

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

/** GET /api/ingredients — public, paginated */
export const listIngredients = async (req, res) => {
  try {
    const page = parseIntOr(req.query.page, 1);
    const limit = Math.min(parseIntOr(req.query.limit, 20), 100);
    const sort = buildSort(req.query.sort);

    const filter = { isActive: true };

    const [total, items] = await Promise.all([
      Ingredient.countDocuments(filter),
      Ingredient.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    ]);

    return res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      items,
    });
  } catch (err) {
    console.error("listIngredients error:", err);
    return errorResponse(res, 500, "Unable to list ingredients.", "SERVER_ERROR");
  }
};

/** GET /api/ingredients/:id — public */
export const getIngredient = async (req, res) => {
  try {
    const ing = await Ingredient.findById(req.params.id);
    if (!ing || !ing.isActive) {
      return errorResponse(res, 404, "Ingredient not found.", "NOT_FOUND");
    }
    return res.json(ing);
  } catch (err) {
    console.error("getIngredient error:", err);
    return errorResponse(res, 500, "Unable to get ingredient.", "SERVER_ERROR");
  }
};

/** POST /api/ingredients — admin only */
export const createIngredient = async (req, res) => {
  try {
    const { name, synonyms } = req.body || {};
    if (!name || !name.trim()) {
      return errorResponse(res, 400, "Name is required.", "VALIDATION_ERROR", { field: "name" });
    }

    const ing = await Ingredient.create({
      name: name.trim(),
      synonyms: Array.isArray(synonyms) ? synonyms : [],
    });

    return res.status(201).json(ing);
  } catch (err) {
    if (err?.code === 11000) {
      return errorResponse(res, 409, "Ingredient name must be unique.", "CONFLICT", { field: "name" });
    }
    console.error("createIngredient error:", err);
    return errorResponse(res, 500, "Unable to create ingredient.", "SERVER_ERROR");
  }
};

/** PATCH /api/ingredients/:id — admin only */
export const updateIngredient = async (req, res) => {
  try {
    const ing = await Ingredient.findById(req.params.id);
    if (!ing || !ing.isActive) {
      return errorResponse(res, 404, "Ingredient not found.", "NOT_FOUND");
    }

    const allowed = ["name", "synonyms"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        ing[key] = req.body[key];
      }
    }

    await ing.save();
    return res.json(ing);
  } catch (err) {
    if (err?.code === 11000) {
      return errorResponse(res, 409, "Ingredient name must be unique.", "CONFLICT", { field: "name" });
    }
    console.error("updateIngredient error:", err);
    return errorResponse(res, 500, "Unable to update ingredient.", "SERVER_ERROR");
  }
};

/** DELETE /api/ingredients/:id — admin only (hard delete per spec) */
export const deleteIngredient = async (req, res) => {
  try {
    const ing = await Ingredient.findByIdAndDelete(req.params.id);
    if (!ing) {
      return errorResponse(res, 404, "Ingredient not found.", "NOT_FOUND");
    }
    return res.status(204).send();
  } catch (err) {
    console.error("deleteIngredient error:", err);
    return errorResponse(res, 500, "Unable to delete ingredient.", "SERVER_ERROR");
  }
};
