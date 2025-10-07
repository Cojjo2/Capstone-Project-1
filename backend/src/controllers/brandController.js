import Brand from "../models/Brand.js";

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

/** GET /api/brands — public, paginated */
export const listBrands = async (req, res) => {
  try {
    const page = parseIntOr(req.query.page, 1);
    const limit = Math.min(parseIntOr(req.query.limit, 20), 100);
    const sort = buildSort(req.query.sort);

    const filter = { isActive: true };
    if (req.query.name) {
      filter.name = new RegExp(req.query.name, "i");
    }

    const [total, items] = await Promise.all([
      Brand.countDocuments(filter),
      Brand.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    ]);

    return res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      items,
    });
  } catch (err) {
    console.error("listBrands error:", err);
    return errorResponse(res, 500, "Unable to list brands.", "SERVER_ERROR");
  }
};

/** GET /api/brands/:id — public */
export const getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand || !brand.isActive) {
      return errorResponse(res, 404, "Brand not found.", "NOT_FOUND");
    }
    return res.json(brand);
  } catch (err) {
    console.error("getBrand error:", err);
    return errorResponse(res, 500, "Unable to get brand.", "SERVER_ERROR");
  }
};

/** POST /api/brands — admin only */
export const createBrand = async (req, res) => {
  try {
    const { name, website } = req.body || {};
    if (!name || !name.trim()) {
      return errorResponse(res, 400, "Name is required.", "VALIDATION_ERROR", { field: "name" });
    }

    const brand = await Brand.create({
      name: name.trim(),
      website: website?.trim() || "",
    });

    return res.status(201).json(brand);
  } catch (err) {
    if (err?.code === 11000) {
      return errorResponse(res, 409, "Brand name must be unique.", "CONFLICT", { field: "name" });
    }
    console.error("createBrand error:", err);
    return errorResponse(res, 500, "Unable to create brand.", "SERVER_ERROR");
  }
};

/** PATCH /api/brands/:id — admin only */
export const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand || !brand.isActive) {
      return errorResponse(res, 404, "Brand not found.", "NOT_FOUND");
    }

    const allowed = ["name", "website", "isActive"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        brand[key] = req.body[key];
      }
    }

    await brand.save();
    return res.json(brand);
  } catch (err) {
    if (err?.code === 11000) {
      return errorResponse(res, 409, "Brand name must be unique.", "CONFLICT", { field: "name" });
    }
    console.error("updateBrand error:", err);
    return errorResponse(res, 500, "Unable to update brand.", "SERVER_ERROR");
  }
};

/** DELETE /api/brands/:id — admin only (hard delete per spec) */
export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) {
      return errorResponse(res, 404, "Brand not found.", "NOT_FOUND");
    }
    return res.status(204).send();
  } catch (err) {
    console.error("deleteBrand error:", err);
    return errorResponse(res, 500, "Unable to delete brand.", "SERVER_ERROR");
  }
};
