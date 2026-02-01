// src/validators/task.validator.js
import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title must be less than 200 characters"),
    description: z
      .string()
      .max(2000, "Description must be less than 2000 characters")
      .optional()
      .default(""),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
    status: z.enum(["todo", "in_progress", "done"]).default("todo"),
    dueDate: z.string().datetime().optional().nullable(),
    tags: z.array(z.string().max(50)).default([]).optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid task ID"),
  }),
  body: z.object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title must be less than 200 characters")
      .optional(),
    description: z
      .string()
      .max(2000, "Description must be less than 2000 characters")
      .optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    status: z.enum(["todo", "in_progress", "done"]).optional(),
    dueDate: z.string().datetime().optional().nullable(),
    tags: z.array(z.string().max(50)).optional(),
  }),
});

export const deleteTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid task ID"),
  }),
});

export const shareTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid task ID"),
  }),
  body: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
    permission: z.enum(["view", "edit", "admin"]).default("view"),
  }),
});

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
  createTaskSchema,
  updateTaskSchema,
  deleteTaskSchema,
  shareTaskSchema,
  validate,
};
