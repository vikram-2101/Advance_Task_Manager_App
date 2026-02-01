// src/tests/task.test.js
import request from "supertest";
import mongoose from "mongoose";
import { app, server } from "../server.js";
import User from "../models/user.model.js";
import Task from "../models/task.model.js";
import { env } from "../config/env.js";

const API_URL = "/api/v1";

let authToken;
let userId;
let taskId;

const testUser = {
  email: "test@example.com",
  name: "Test User",
  password: "Password123",
};

const testTask = {
  title: "Test Task",
  description: "This is a test task",
  priority: "high",
  status: "todo",
  tags: ["important", "urgent"],
};

describe("Task Routes", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI);
    }

    // Register and login user
    const registerRes = await request(app)
      .post(`${API_URL}/auth/register`)
      .send(testUser);

    authToken = registerRes.body.data.accessToken;
    userId = registerRes.body.data.user._id;
  });

  beforeEach(async () => {
    await Task.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Task.deleteMany({});
    await mongoose.disconnect();
    server.close();
  });

  describe("POST /tasks", () => {
    it("should create task successfully", async () => {
      const response = await request(app)
        .post(`${API_URL}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(testTask);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe(testTask.title);
      expect(response.body.data.task.owner).toBe(userId);

      taskId = response.body.data.task._id;
    });

    it("should reject task without title", async () => {
      const response = await request(app)
        .post(`${API_URL}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          ...testTask,
          title: undefined,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should reject task with invalid priority", async () => {
      const response = await request(app)
        .post(`${API_URL}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          ...testTask,
          priority: "invalid",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should reject unauthenticated request", async () => {
      const response = await request(app)
        .post(`${API_URL}/tasks`)
        .send(testTask);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /tasks", () => {
    beforeEach(async () => {
      // Create test tasks
      await request(app)
        .post(`${API_URL}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(testTask);

      await request(app)
        .post(`${API_URL}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          ...testTask,
          title: "Another Task",
          priority: "low",
          status: "done",
        });
    });

    it("should retrieve all tasks", async () => {
      const response = await request(app)
        .get(`${API_URL}/tasks`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(2);
      expect(response.body.data.pagination.total).toBe(2);
    });

    it("should filter tasks by status", async () => {
      const response = await request(app)
        .get(`${API_URL}/tasks?status=done`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.data[0].status).toBe("done");
    });

    it("should filter tasks by priority", async () => {
      const response = await request(app)
        .get(`${API_URL}/tasks?priority=high`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.data[0].priority).toBe("high");
    });

    it("should search tasks by title", async () => {
      const response = await request(app)
        .get(`${API_URL}/tasks?search=Another`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.data[0].title).toContain("Another");
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get(`${API_URL}/tasks?page=1&limit=1`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.pages).toBe(2);
    });
  });

  describe("GET /tasks/:id", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post(`${API_URL}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(testTask);

      taskId = response.body.data.task._id;
    });

    it("should get task by ID", async () => {
      const response = await request(app)
        .get(`${API_URL}/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.task._id).toBe(taskId);
    });

    it("should reject invalid task ID", async () => {
      const response = await request(app)
        .get(`${API_URL}/tasks/invalid-id`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it("should reject non-existent task", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`${API_URL}/tasks/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PATCH /tasks/:id", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post(`${API_URL}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(testTask);

      taskId = response.body.data.task._id;
    });

    it("should update task successfully", async () => {
      const response = await request(app)
        .patch(`${API_URL}/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated Task",
          status: "in_progress",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe("Updated Task");
      expect(response.body.data.task.status).toBe("in_progress");
    });

    it("should not update non-existent task", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`${API_URL}/tasks/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Updated" });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /tasks/:id", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post(`${API_URL}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(testTask);

      taskId = response.body.data.task._id;
    });

    it("should delete task successfully", async () => {
      const response = await request(app)
        .delete(`${API_URL}/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify task is soft deleted
      const getResponse = await request(app)
        .get(`${API_URL}/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });

  describe("POST /tasks/:id/share", () => {
    let otherUser;
    let otherUserId;

    beforeEach(async () => {
      // Create another user
      const registerRes = await request(app)
        .post(`${API_URL}/auth/register`)
        .send({
          email: "other@example.com",
          name: "Other User",
          password: "Password123",
        });

      otherUser = registerRes.body.data.user;
      otherUserId = registerRes.body.data.user._id;

      // Create a task
      const response = await request(app)
        .post(`${API_URL}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(testTask);

      taskId = response.body.data.task._id;
    });

    it("should share task with another user", async () => {
      const response = await request(app)
        .post(`${API_URL}/tasks/${taskId}/share`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          userId: otherUserId,
          permission: "view",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.task.sharedWith.length).toBe(1);
    });
  });

  describe("GET /tasks/:id/audit", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post(`${API_URL}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(testTask);

      taskId = response.body.data.task._id;

      // Make an update to create audit entries
      await request(app)
        .patch(`${API_URL}/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Updated" });
    });

    it("should retrieve audit log", async () => {
      const response = await request(app)
        .get(`${API_URL}/tasks/${taskId}/audit`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.logs)).toBe(true);
    });
  });
});
