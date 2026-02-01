// src/controllers/auth.controller.js
import * as authService from "../services/auth.service.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

/**
 * Register user
 */
export const register = asyncHandler(async (req, res) => {
  const { email, name, password } = req.validated.body;

  const result = await authService.register(email, name, password);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

/**
 * Login user
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;

  const result = await authService.login(email, password);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

/**
 * Refresh access token
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.validated.body;

  const result = await authService.refreshAccessToken(token);

  res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

/**
 * Get user profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.userId);

  res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    data: { user },
  });
});

export default {
  register,
  login,
  refreshToken,
  getProfile,
};
