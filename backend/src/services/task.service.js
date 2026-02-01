// src/services/task.service.js
import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import Audit from "../models/audit.model.js";
import logger from "../utils/logger.js";

/**
 * Create task
 */
export const createTask = async (userId, taskData) => {
  const task = new Task({
    ...taskData,
    owner: userId,
  });

  await task.save();

  // Log audit
  await Audit.create({
    action: "CREATE",
    entityType: "TASK",
    entityId: task._id,
    userId,
    changes: taskData,
  });

  logger.info({ taskId: task._id, userId }, "Task created");

  return task;
};

/**
 * Get all tasks for user with filtering, pagination, and sorting
 */
export const getTasks = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    sortBy = "createdAt",
    sortOrder = "desc",
    search,
    tags,
  } = options;

  const query = {
    $or: [{ owner: userId }, { "sharedWith.userId": userId }],
  };

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (tags && tags.length > 0) query.tags = { $in: tags };

  if (search) {
    query.$or.push({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    });
  }

  const skip = (page - 1) * limit;
  const sortObj = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate("owner", "name email"),
    Task.countDocuments(query),
  ]);

  return {
    data: tasks,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single task by ID
 */
export const getTaskById = async (taskId, userId) => {
  const task = await Task.findById(taskId).populate("owner", "name email");

  if (!task) {
    throw {
      statusCode: 404,
      message: "Task not found",
    };
  }

  // Check if user has access
  const hasAccess =
    task.owner._id.equals(userId) ||
    task.sharedWith.some((share) => share.userId.equals(userId));

  if (!hasAccess) {
    throw {
      statusCode: 403,
      message: "You do not have access to this task",
    };
  }

  return task;
};

/**
 * Update task
 */
export const updateTask = async (taskId, userId, updates) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw {
      statusCode: 404,
      message: "Task not found",
    };
  }

  // Check if user is owner or has edit permission
  const isOwner = task.owner.equals(userId);
  const sharedWith = task.sharedWith.find((s) => s.userId.equals(userId));
  const canEdit =
    isOwner ||
    sharedWith?.permission === "edit" ||
    sharedWith?.permission === "admin";

  if (!canEdit) {
    throw {
      statusCode: 403,
      message: "You do not have permission to edit this task",
    };
  }

  const originalTask = task.toObject();

  Object.assign(task, updates);
  await task.save();

  // Log audit
  const changes = Object.keys(updates).reduce((acc, key) => {
    if (originalTask[key] !== updates[key]) {
      acc[key] = {
        old: originalTask[key],
        new: updates[key],
      };
    }
    return acc;
  }, {});

  await Audit.create({
    action: "UPDATE",
    entityType: "TASK",
    entityId: task._id,
    userId,
    changes,
  });

  logger.info({ taskId, userId }, "Task updated");

  return task;
};

/**
 * Delete task (soft delete)
 */
export const deleteTask = async (taskId, userId) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw {
      statusCode: 404,
      message: "Task not found",
    };
  }

  // Only owner can delete
  if (!task.owner.equals(userId)) {
    throw {
      statusCode: 403,
      message: "You do not have permission to delete this task",
    };
  }

  task.isDeleted = true;
  await task.save();

  // Log audit
  await Audit.create({
    action: "DELETE",
    entityType: "TASK",
    entityId: task._id,
    userId,
  });

  logger.info({ taskId, userId }, "Task deleted");

  return task;
};

/**
 * Share task with another user
 */
export const shareTask = async (
  taskId,
  userId,
  shareUserId,
  permission = "view",
) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw {
      statusCode: 404,
      message: "Task not found",
    };
  }

  // Only owner can share
  if (!task.owner.equals(userId)) {
    throw {
      statusCode: 403,
      message: "You do not have permission to share this task",
    };
  }

  // Check if user exists
  const user = await User.findById(shareUserId);
  if (!user) {
    throw {
      statusCode: 404,
      message: "User not found",
    };
  }

  // Check if already shared
  const existingShare = task.sharedWith.findIndex((s) =>
    s.userId.equals(shareUserId),
  );

  if (existingShare >= 0) {
    task.sharedWith[existingShare].permission = permission;
  } else {
    task.sharedWith.push({
      userId: shareUserId,
      permission,
    });
  }

  await task.save();

  logger.info(
    { taskId, userId, sharedWith: shareUserId, permission },
    "Task shared",
  );

  return task;
};

/**
 * Remove share from task
 */
export const unshareTask = async (taskId, userId, unshareUserId) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw {
      statusCode: 404,
      message: "Task not found",
    };
  }

  // Only owner can unshare
  if (!task.owner.equals(userId)) {
    throw {
      statusCode: 403,
      message: "You do not have permission to modify sharing on this task",
    };
  }

  task.sharedWith = task.sharedWith.filter(
    (s) => !s.userId.equals(unshareUserId),
  );
  await task.save();

  logger.info({ taskId, userId, unsharedWith: unshareUserId }, "Task unshared");

  return task;
};

/**
 * Get task audit history
 */
export const getTaskAuditLog = async (taskId, userId, limit = 50) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw {
      statusCode: 404,
      message: "Task not found",
    };
  }

  // Check access
  const hasAccess =
    task.owner.equals(userId) ||
    task.sharedWith.some((share) => share.userId.equals(userId));

  if (!hasAccess) {
    throw {
      statusCode: 403,
      message: "You do not have access to this task",
    };
  }

  const logs = await Audit.find({
    entityType: "TASK",
    entityId: taskId,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "name email");

  return logs;
};

export default {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  shareTask,
  unshareTask,
  getTaskAuditLog,
};
