// src/controllers/task.controller.js
import * as taskService from "../services/task.service.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

/**
 * Create task
 */
export const createTask = asyncHandler(async (req, res) => {
  const taskData = req.validated.body;
  const task = await taskService.createTask(req.user.userId, taskData);

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: { task },
  });
});

/**
 * Get all tasks with filtering and pagination
 */
export const getTasks = asyncHandler(async (req, res) => {
  const { page, limit, status, priority, sortBy, sortOrder, search, tags } =
    req.query;

  const result = await taskService.getTasks(req.user.userId, {
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 10,
    status,
    priority,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder || "desc",
    search,
    tags: tags ? (Array.isArray(tags) ? tags : [tags]) : undefined,
  });

  res.status(200).json({
    success: true,
    message: "Tasks retrieved successfully",
    data: result,
  });
});

/**
 * Get single task
 */
export const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id, req.user.userId);

  res.status(200).json({
    success: true,
    message: "Task retrieved successfully",
    data: { task },
  });
});

/**
 * Update task
 */
export const updateTask = asyncHandler(async (req, res) => {
  const updates = req.validated.body;
  const task = await taskService.updateTask(
    req.params.id,
    req.user.userId,
    updates,
  );

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: { task },
  });
});

/**
 * Delete task
 */
export const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id, req.user.userId);

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
});

/**
 * Share task with user
 */
export const shareTask = asyncHandler(async (req, res) => {
  const { userId, permission } = req.validated.body;
  const task = await taskService.shareTask(
    req.params.id,
    req.user.userId,
    userId,
    permission,
  );

  res.status(200).json({
    success: true,
    message: "Task shared successfully",
    data: { task },
  });
});

/**
 * Unshare task
 */
export const unshareTask = asyncHandler(async (req, res) => {
  const { userId } = req.query;
  const task = await taskService.unshareTask(
    req.params.id,
    req.user.userId,
    userId,
  );

  res.status(200).json({
    success: true,
    message: "Task unshared successfully",
    data: { task },
  });
});

/**
 * Get task audit log
 */
export const getAuditLog = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const logs = await taskService.getTaskAuditLog(
    req.params.id,
    req.user.userId,
    limit ? parseInt(limit, 10) : 50,
  );

  res.status(200).json({
    success: true,
    message: "Audit log retrieved successfully",
    data: { logs },
  });
});

export default {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  shareTask,
  unshareTask,
  getAuditLog,
};
