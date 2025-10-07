import Dog from "../models/Dog.js";

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

/** GET /api/dogs — list dogs (auth required)
 *  - Non-admin users see ONLY their own dogs.
 *  - Admins can see all, optionally filter by ownerId.
 *  - Filters: ownerId (admin only), breed
 *  - Pagination: page, limit
 *  - Sorting: sort (e.g. name or -createdAt)
 */
export const listDogs = async (req, res) => {
  try {
    const page = parseIntOr(req.query.page, 1);
    const limit = Math.min(parseIntOr(req.query.limit, 20), 100);
    const sort = buildSort(req.query.sort);

    const filter = { isActive: true };

    if (req.user.role === "admin") {
      if (req.query.ownerId) filter.ownerId = req.query.ownerId;
    } else {
      // regular users: restrict to their own dogs
      filter.ownerId = req.user.id;
    }

    if (req.query.breed) {
      filter.breed = req.query.breed;
    }

    const [total, items] = await Promise.all([
      Dog.countDocuments(filter),
      Dog.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    ]);

    return res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      items,
    });
  } catch (err) {
    console.error("listDogs error:", err);
    return errorResponse(res, 500, "Unable to list dogs.", "SERVER_ERROR");
  }
};

/** GET /api/dogs/:id — retrieve one (owner or admin) */
export const getDog = async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id);
    if (!dog || !dog.isActive) {
      return errorResponse(res, 404, "Dog not found.", "NOT_FOUND");
    }
    if (req.user.role !== "admin" && dog.ownerId.toString() !== req.user.id) {
      return errorResponse(res, 403, "Forbidden.", "FORBIDDEN");
    }
    return res.json(dog);
  } catch (err) {
    console.error("getDog error:", err);
    return errorResponse(res, 500, "Unable to get dog.", "SERVER_ERROR");
  }
};

/** POST /api/dogs — create (owner = current user) */
export const createDog = async (req, res) => {
  try {
    const { name, breed, age, restrictions } = req.body || {};
    if (!name) {
      return errorResponse(res, 400, "Name is required.", "VALIDATION_ERROR", { field: "name" });
    }

    const dog = await Dog.create({
      name,
      breed: breed || "",
      age: typeof age === "number" ? age : undefined,
      ownerId: req.user.id,
      restrictions: Array.isArray(restrictions) ? restrictions : [],
    });

    return res.status(201).json(dog);
  } catch (err) {
    console.error("createDog error:", err);
    return errorResponse(res, 500, "Unable to create dog.", "SERVER_ERROR");
  }
};

/** PATCH /api/dogs/:id — update (owner or admin) */
export const updateDog = async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id);
    if (!dog || !dog.isActive) {
      return errorResponse(res, 404, "Dog not found.", "NOT_FOUND");
    }
    if (req.user.role !== "admin" && dog.ownerId.toString() !== req.user.id) {
      return errorResponse(res, 403, "Forbidden.", "FORBIDDEN");
    }

    const allowed = ["name", "breed", "age", "restrictions"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        dog[key] = req.body[key];
      }
    }

    await dog.save();
    return res.json(dog);
  } catch (err) {
    console.error("updateDog error:", err);
    return errorResponse(res, 500, "Unable to update dog.", "SERVER_ERROR");
  }
};

/** DELETE /api/dogs/:id — soft delete (owner or admin) */
export const deleteDog = async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id);
    if (!dog || !dog.isActive) {
      return errorResponse(res, 404, "Dog not found.", "NOT_FOUND");
    }
    if (req.user.role !== "admin" && dog.ownerId.toString() !== req.user.id) {
      return errorResponse(res, 403, "Forbidden.", "FORBIDDEN");
    }

    dog.isActive = false;
    await dog.save();

    return res.status(204).send();
  } catch (err) {
    console.error("deleteDog error:", err);
    return errorResponse(res, 500, "Unable to delete dog.", "SERVER_ERROR");
  }
};
