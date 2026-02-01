// src/routes/task.routes.js
import express from "express";
import * as taskController from "../controllers/task.controller.js";
import {
  validate,
  createTaskSchema,
  updateTaskSchema,
  deleteTaskSchema,
  shareTaskSchema,
} from "../validators/task.validator.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { generalLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// All task routes require authentication
router.use(authenticate, generalLimiter);

/**
 * POST /api/v1/tasks
 * Create a new task
 */
router.post("/", validate(createTaskSchema), taskController.createTask);

/**
 * GET /api/v1/tasks
 * Get all tasks with filtering, searching, and pagination
 * Query parameters:
 *   - page: number (default: 1)
 *   - limit: number (default: 10)
 *   - status: todo|in_progress|done
 *   - priority: low|medium|high
 *   - sortBy: field name (default: createdAt)
 *   - sortOrder: asc|desc (default: desc)
 *   - search: string (searches title and description)
 *   - tags: string or array
 */
router.get("/", taskController.getTasks);

/**
 * GET /api/v1/tasks/:id
 * Get a single task by ID
 */
router.get("/:id", taskController.getTask);

/**
 * PATCH /api/v1/tasks/:id
 * Update a task
 */
router.patch("/:id", validate(updateTaskSchema), taskController.updateTask);

/**
 * DELETE /api/v1/tasks/:id
 * Delete a task (soft delete)
 */
router.delete("/:id", validate(deleteTaskSchema), taskController.deleteTask);

/**
 * POST /api/v1/tasks/:id/share
 * Share task with another user
 */
router.post("/:id/share", validate(shareTaskSchema), taskController.shareTask);

/**
 * DELETE /api/v1/tasks/:id/share
 * Unshare task from user
 * Query parameter: userId
 */
router.delete("/:id/share", taskController.unshareTask);

/**
 * GET /api/v1/tasks/:id/audit
 * Get audit log for a task
 * Query parameters:
 *   - limit: number (default: 50)
 */
router.get("/:id/audit", taskController.getAuditLog);

export default router;
