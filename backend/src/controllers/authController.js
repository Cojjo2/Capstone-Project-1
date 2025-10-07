import jwt from "jsonwebtoken";
import User from "../models/User.js";

/** Helper: remove sensitive fields before sending user back */
const sanitizeUser = (userDoc) => {
  const { _id, name, email, role, isActive, createdAt, updatedAt } = userDoc;
  return { _id, name, email, role, isActive, createdAt, updatedAt };
};

/** Helper: standard error shape (matches your API spec) */
const errorResponse = (res, status, message, code = "SERVER_ERROR", details = {}) => {
  return res.status(status).json({
    error: { message, code, details }
  });
};

/** POST /api/auth/register */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return errorResponse(res, 400, "Name, email, and password are required.", "VALIDATION_ERROR", {
        fields: ["name", "email", "password"]
      });
    }
    if (password.length < 8) {
      return errorResponse(res, 400, "Password must be at least 8 characters.", "VALIDATION_ERROR", {
        field: "password"
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return errorResponse(res, 409, "Email already registered.", "CONFLICT", { field: "email" });
    }

    const user = await User.create({ name, email, password });
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error("Register error:", err);
    return errorResponse(res, 500, "Unable to register.", "SERVER_ERROR");
  }
};

/** POST /api/auth/login */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required.", "VALIDATION_ERROR", {
        fields: ["email", "password"]
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return errorResponse(res, 401, "Invalid credentials.", "AUTH_REQUIRED");
    }
    if (!user.isActive) {
      return errorResponse(res, 403, "Account is inactive.", "FORBIDDEN");
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return errorResponse(res, 401, "Invalid credentials.", "AUTH_REQUIRED");
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error("Login error:", err);
    return errorResponse(res, 500, "Unable to login.", "SERVER_ERROR");
  }
};

/** GET /api/auth/me (will require auth middleware later) */
export const me = async (req, res) => {
  try {
    // req.user will be set by auth middleware (next step)
    if (!req.user) {
      return errorResponse(res, 401, "Not authenticated.", "AUTH_REQUIRED");
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 404, "User not found.", "NOT_FOUND");
    }
    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error("Me error:", err);
    return errorResponse(res, 500, "Unable to fetch profile.", "SERVER_ERROR");
  }
};
