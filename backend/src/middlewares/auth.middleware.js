// src/middlewares/auth.middleware.js
import { verifyAccessToken } from "../utils/token.js";
import logger from "../utils/logger.js";

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error(error, "Auth middleware error");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Authorization middleware - checks user role
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(
        { userId: req.user.userId, requiredRole: roles },
        "Unauthorized access attempt",
      );
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

export default { authenticate, authorize };
