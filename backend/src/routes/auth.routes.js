// src/routes/auth.routes.js
import express from "express";
import * as authController from "../controllers/auth.controller.js";
import {
  validate,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../validators/auth.validator.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  authLimiter,
  createAccountLimiter,
} from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post(
  "/register",
  createAccountLimiter,
  validate(registerSchema),
  authController.register,
);

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post("/login", authLimiter, validate(loginSchema), authController.login);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refreshToken,
);

/**
 * GET /api/v1/auth/profile
 * Get user profile
 */
router.get("/profile", authenticate, authController.getProfile);

export default router;
