// src/tests/auth.test.js
import request from "supertest";
import mongoose from "mongoose";
import { app, server } from "../server.js";
import User from "../models/user.model.js";
import { env } from "../config/env.js";

const API_URL = "/api/v1/auth";

// Test user data
const testUser = {
  email: "test@example.com",
  name: "Test User",
  password: "Password123",
};

describe("Authentication Routes", () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI);
    }
  });

  beforeEach(async () => {
    // Clear users collection before each test
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
    server.close();
  });

  describe("POST /register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post(`${API_URL}/register`)
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it("should reject duplicate email", async () => {
      // Create first user
      await request(app).post(`${API_URL}/register`).send(testUser);

      // Try to create user with same email
      const response = await request(app)
        .post(`${API_URL}/register`)
        .send(testUser);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it("should reject invalid email", async () => {
      const response = await request(app)
        .post(`${API_URL}/register`)
        .send({
          ...testUser,
          email: "invalid-email",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should reject weak password", async () => {
      const response = await request(app)
        .post(`${API_URL}/register`)
        .send({
          ...testUser,
          password: "weak",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should reject mismatched passwords", async () => {
      const response = await request(app)
        .post(`${API_URL}/register`)
        .send({
          ...testUser,
          confirmPassword: "DifferentPassword123",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /login", () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app).post(`${API_URL}/register`).send(testUser);
    });

    it("should login user successfully", async () => {
      const response = await request(app).post(`${API_URL}/login`).send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it("should reject invalid email", async () => {
      const response = await request(app).post(`${API_URL}/login`).send({
        email: "wrong@example.com",
        password: testUser.password,
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should reject invalid password", async () => {
      const response = await request(app).post(`${API_URL}/login`).send({
        email: testUser.email,
        password: "WrongPassword123",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /refresh", () => {
    let refreshToken;

    beforeEach(async () => {
      const response = await request(app)
        .post(`${API_URL}/register`)
        .send(testUser);

      refreshToken = response.body.data.refreshToken;
    });

    it("should refresh token successfully", async () => {
      const response = await request(app)
        .post(`${API_URL}/refresh`)
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it("should reject invalid refresh token", async () => {
      const response = await request(app)
        .post(`${API_URL}/refresh`)
        .send({ refreshToken: "invalid-token" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /profile", () => {
    let accessToken;

    beforeEach(async () => {
      const response = await request(app)
        .post(`${API_URL}/register`)
        .send(testUser);

      accessToken = response.body.data.accessToken;
    });

    it("should get user profile successfully", async () => {
      const response = await request(app)
        .get(`${API_URL}/profile`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it("should reject request without token", async () => {
      const response = await request(app).get(`${API_URL}/profile`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should reject request with invalid token", async () => {
      const response = await request(app)
        .get(`${API_URL}/profile`)
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
