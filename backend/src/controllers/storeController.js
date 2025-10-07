import Store from "../models/Store.js";

const errorResponse = (res, status, message, code = "SERVER_ERROR", details = {}) =>
  res.status(status).json({ error: { message, code, details } });

/** POST /api/stores — create store (admin only) */
export const createStore = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return errorResponse(res, 403, "Forbidden.", "FORBIDDEN");
    }
    const { name, url, location } = req.body;
    if (!name) return errorResponse(res, 400, "name is required.", "VALIDATION_ERROR");

    const store = await Store.create({ name, url, location });
    res.status(201).json(store);
  } catch (err) {
    if (err.code === 11000)
      return errorResponse(res, 409, "Store already exists.", "CONFLICT");
    console.error("createStore error:", err);
    errorResponse(res, 500, "Unable to create store.");
  }
};

/** GET /api/stores — list stores (public) */
export const listStores = async (_req, res) => {
  try {
    const stores = await Store.find({ isActive: true });
    res.json(stores);
  } catch (err) {
    console.error("listStores error:", err);
    errorResponse(res, 500, "Unable to list stores.");
  }
};

/** PATCH /api/stores/:id — update store (admin) */
export const updateStore = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return errorResponse(res, 403, "Forbidden.", "FORBIDDEN");

    const store = await Store.findById(req.params.id);
    if (!store) return errorResponse(res, 404, "Store not found.", "NOT_FOUND");

    const fields = ["name", "url", "location", "isActive"];
    for (const f of fields) if (req.body[f] !== undefined) store[f] = req.body[f];
    await store.save();
    res.json(store);
  } catch (err) {
    console.error("updateStore error:", err);
    errorResponse(res, 500, "Unable to update store.");
  }
};

/** DELETE /api/stores/:id — delete store (admin) */
export const deleteStore = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return errorResponse(res, 403, "Forbidden.", "FORBIDDEN");

    const store = await Store.findById(req.params.id);
    if (!store) return errorResponse(res, 404, "Store not found.", "NOT_FOUND");

    await store.deleteOne();
    res.status(204).send();
  } catch (err) {
    console.error("deleteStore error:", err);
    errorResponse(res, 500, "Unable to delete store.");
  }
};
