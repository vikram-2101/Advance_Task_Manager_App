// src/validators/auth.validator.js
import { z } from "zod";

export const registerSchema = z.object({
  body: z
    .object({
      email: z
        .string()
        .email("Invalid email format")
        .min(5, "Email must be at least 5 characters"),
      name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters"),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .regex(
          /^(?=.*[A-Za-z])(?=.*\d)/,
          "Password must contain at least one letter and one number",
        ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

/**
 * Validate request with Zod schema
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      req.validated = validated;
      next();
    } catch (error) {
      const errors = error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));

      res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }
  };
};

export default {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  validate,
};
