import jwt from "jsonwebtoken";

/** Standard error shape helper (matches your API spec) */
const errorResponse = (res, status, message, code = "SERVER_ERROR", details = {}) => {
  return res.status(status).json({ error: { message, code, details } });
};

/** Authenticate: checks "Authorization: Bearer <token>" and sets req.user */
export const authenticate = (req, res, next) => {
  const auth = req.headers.authorization || "";
  const [scheme, token] = auth.split(" ");

  if (scheme !== "Bearer" || !token) {
    return errorResponse(res, 401, "Not authenticated.", "AUTH_REQUIRED");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch (err) {
    return errorResponse(res, 401, "Invalid or expired token.", "AUTH_REQUIRED");
  }
};

/** Optional: role guard for admin/user-only routes */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 401, "Not authenticated.", "AUTH_REQUIRED");
  }
  if (!roles.includes(req.user.role)) {
    return errorResponse(res, 403, "Forbidden.", "FORBIDDEN");
  }
  return next();
};
