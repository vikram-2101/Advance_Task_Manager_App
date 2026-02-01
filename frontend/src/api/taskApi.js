// src/api/taskApi.js
import axiosClient from "./axiosClient.js";

export const taskApi = {
  // Get all tasks with filters
  getTasks: (params = {}) => axiosClient.get("/tasks", { params }),

  // Get single task
  getTask: (id) => axiosClient.get(`/tasks/${id}`),

  // Create task
  createTask: (taskData) => axiosClient.post("/tasks", taskData),

  // Update task
  updateTask: (id, updates) => axiosClient.patch(`/tasks/${id}`, updates),

  // Delete task
  deleteTask: (id) => axiosClient.delete(`/tasks/${id}`),

  // Share task
  shareTask: (id, userId, permission = "view") =>
    axiosClient.post(`/tasks/${id}/share`, { userId, permission }),

  // Unshare task
  unshareTask: (id, userId) =>
    axiosClient.delete(`/tasks/${id}/share`, { params: { userId } }),

  // Get audit log
  getAuditLog: (id, limit = 50) =>
    axiosClient.get(`/tasks/${id}/audit`, { params: { limit } }),
};

export default taskApi;
