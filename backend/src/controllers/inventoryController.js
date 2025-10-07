import Inventory from "../models/Inventory.js";
import Store from "../models/Store.js";
import Product from "../models/Product.js";

const errorResponse = (res, status, message, code = "SERVER_ERROR", details = {}) =>
  res.status(status).json({ error: { message, code, details } });

/** POST /api/inventory — add inventory (admin) */
export const createInventory = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return errorResponse(res, 403, "Forbidden.", "FORBIDDEN");

    const { storeId, productId, price, inStock } = req.body;
    if (!storeId || !productId || price == null)
      return errorResponse(res, 400, "storeId, productId, and price are required.", "VALIDATION_ERROR");

    const [store, product] = await Promise.all([
      Store.findById(storeId),
      Product.findById(productId),
    ]);
    if (!store || !product)
      return errorResponse(res, 404, "Store or product not found.", "NOT_FOUND");

    const inv = await Inventory.create({ storeId, productId, price, inStock });
    res.status(201).json(inv);
  } catch (err) {
    if (err.code === 11000)
      return errorResponse(res, 409, "Inventory already exists.", "CONFLICT");
    console.error("createInventory error:", err);
    errorResponse(res, 500, "Unable to create inventory.");
  }
};

/** GET /api/inventory — list all inventory (public) */
export const listInventory = async (_req, res) => {
  try {
    const items = await Inventory.find()
      .populate("storeId")
      .populate("productId");
    res.json(items);
  } catch (err) {
    console.error("listInventory error:", err);
    errorResponse(res, 500, "Unable to list inventory.");
  }
};

/** PATCH /api/inventory/:id — update price / stock (admin) */
export const updateInventory = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return errorResponse(res, 403, "Forbidden.", "FORBIDDEN");

    const inv = await Inventory.findById(req.params.id);
    if (!inv) return errorResponse(res, 404, "Inventory not found.", "NOT_FOUND");

    const fields = ["price", "inStock"];
    for (const f of fields) if (req.body[f] !== undefined) inv[f] = req.body[f];
    await inv.save();
    res.json(inv);
  } catch (err) {
    console.error("updateInventory error:", err);
    errorResponse(res, 500, "Unable to update inventory.");
  }
};

/** DELETE /api/inventory/:id — delete (admin) */
export const deleteInventory = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return errorResponse(res, 403, "Forbidden.", "FORBIDDEN");

    const inv = await Inventory.findById(req.params.id);
    if (!inv) return errorResponse(res, 404, "Inventory not found.", "NOT_FOUND");

    await inv.deleteOne();
    res.status(204).send();
  } catch (err) {
    console.error("deleteInventory error:", err);
    errorResponse(res, 500, "Unable to delete inventory.");
  }
};
