// src/services/auth.service.js
import User from "../models/user.model.js";
import Audit from "../models/audit.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token.js";
import logger from "../utils/logger.js";

/**
 * Register new user
 */
export const register = async (email, name, password) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw {
      statusCode: 409,
      message: "User with this email already exists",
    };
  }

  // Create new user
  const user = new User({
    email,
    name,
    password,
  });

  await user.save();

  // Log registration
  await Audit.create({
    action: "CREATE",
    entityType: "USER",
    entityId: user._id,
    userId: user._id,
    metadata: { email },
  });

  logger.info({ userId: user._id, email }, "User registered");

  return {
    user: user.toJSON(),
    accessToken: generateAccessToken(user._id.toString(), user.role),
    refreshToken: generateRefreshToken(user._id.toString()),
  };
};

/**
 * Login user
 */
export const login = async (email, password) => {
  // Find user and include password field
  const user = await User.findOne({ email }).select(
    "+password +lockUntil +loginAttempts",
  );

  if (!user || !user.isActive) {
    throw {
      statusCode: 401,
      message: "Invalid email or password",
    };
  }

  // Check if account is locked
  if (user.isLocked()) {
    logger.warn({ userId: user._id }, "Login attempt on locked account");
    throw {
      statusCode: 423,
      message:
        "Account is locked due to too many failed login attempts. Please try again later.",
    };
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    // Record failed attempt
    await user.incLoginAttempts();

    logger.warn(
      { userId: user._id, attempts: user.loginAttempts + 1 },
      "Failed login attempt",
    );

    // Log failed attempt
    await Audit.create({
      action: "LOGIN_FAILURE",
      entityType: "USER",
      entityId: user._id,
      userId: user._id,
    });

    throw {
      statusCode: 401,
      message: "Invalid email or password",
    };
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Log successful login
  await Audit.create({
    action: "LOGIN",
    entityType: "USER",
    entityId: user._id,
    userId: user._id,
  });

  logger.info({ userId: user._id, email }, "User logged in");

  return {
    user: user.toJSON(),
    accessToken: generateAccessToken(user._id.toString(), user.role),
    refreshToken: generateRefreshToken(user._id.toString()),
  };
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    throw {
      statusCode: 401,
      message: "Invalid or expired refresh token",
    };
  }

  const user = await User.findById(decoded.userId);

  if (!user || !user.isActive) {
    throw {
      statusCode: 401,
      message: "User not found or inactive",
    };
  }

  return {
    accessToken: generateAccessToken(user._id.toString(), user.role),
    refreshToken: generateRefreshToken(user._id.toString()),
  };
};

/**
 * Get user profile
 */
export const getProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw {
      statusCode: 404,
      message: "User not found",
    };
  }

  return user.toJSON();
};

export default {
  register,
  login,
  refreshAccessToken,
  getProfile,
};
