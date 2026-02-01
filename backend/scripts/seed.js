// server/scripts/seed.js
import mongoose from "mongoose";
import User from "../src/models/user.model.js";
import Task from "../src/models/task.model.js";
import Audit from "../src/models/audit.model.js";
import { env } from "../src/config/env.js";
import logger from "../src/utils/logger.js";

const seedDatabase = async () => {
  try {
    logger.info("Starting database seeding...");

    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
    });

    logger.info("Connected to MongoDB");

    // Clear existing data
    logger.info("Clearing existing data...");
    await User.deleteMany({});
    await Task.deleteMany({});
    await Audit.deleteMany({});

    // Create demo users
    logger.info("Creating demo users...");
    const user1 = await User.create({
      email: "demo@example.com",
      name: "Demo User",
      password: "Password123",
      role: "user",
      isActive: true,
    });

    const user2 = await User.create({
      email: "jane@example.com",
      name: "Jane Smith",
      password: "Password123",
      role: "user",
      isActive: true,
    });

    const adminUser = await User.create({
      email: "admin@example.com",
      name: "Admin User",
      password: "AdminPass123",
      role: "admin",
      isActive: true,
    });

    logger.info(`✅ Created 3 users`);

    // Create demo tasks for user1
    logger.info("Creating demo tasks...");
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const task1 = await Task.create({
      title: "Complete project documentation",
      description: "Write comprehensive API docs and user guide",
      priority: "high",
      status: "in_progress",
      dueDate: nextWeek,
      tags: ["documentation", "important"],
      owner: user1._id,
      sharedWith: [
        {
          userId: user2._id,
          permission: "view",
        },
      ],
    });

    const task2 = await Task.create({
      title: "Fix bug in authentication",
      description: "Token refresh is failing on mobile devices",
      priority: "high",
      status: "todo",
      dueDate: tomorrow,
      tags: ["bug", "critical", "auth"],
      owner: user1._id,
      sharedWith: [],
    });

    const task3 = await Task.create({
      title: "Optimize database queries",
      description: "Add indexes and optimize slow queries",
      priority: "medium",
      status: "todo",
      dueDate: nextMonth,
      tags: ["performance", "database"],
      owner: user1._id,
      sharedWith: [],
    });

    const task4 = await Task.create({
      title: "Add password reset feature",
      description:
        "Implement forgot password functionality with email verification",
      priority: "medium",
      status: "todo",
      dueDate: nextMonth,
      tags: ["feature", "security"],
      owner: user1._id,
      sharedWith: [],
    });

    const task5 = await Task.create({
      title: "Code review for PR #42",
      description: "Review the new task sharing implementation",
      priority: "low",
      status: "done",
      dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      tags: ["review", "code"],
      owner: user1._id,
      sharedWith: [],
    });

    // Create demo tasks for user2
    const task6 = await Task.create({
      title: "Update dependencies",
      description: "Update all npm packages to latest versions",
      priority: "medium",
      status: "in_progress",
      dueDate: nextWeek,
      tags: ["maintenance"],
      owner: user2._id,
      sharedWith: [
        {
          userId: user1._id,
          permission: "edit",
        },
      ],
    });

    const task7 = await Task.create({
      title: "Write unit tests",
      description: "Increase test coverage to 80%",
      priority: "high",
      status: "in_progress",
      dueDate: nextMonth,
      tags: ["testing", "quality"],
      owner: user2._id,
      sharedWith: [],
    });

    logger.info(`✅ Created 7 tasks`);

    // Create audit logs
    logger.info("Creating audit logs...");
    const auditLogs = [
      {
        action: "CREATE",
        entityType: "USER",
        entityId: user1._id,
        userId: user1._id,
        metadata: { email: user1.email },
      },
      {
        action: "CREATE",
        entityType: "USER",
        entityId: user2._id,
        userId: user2._id,
        metadata: { email: user2.email },
      },
      {
        action: "CREATE",
        entityType: "TASK",
        entityId: task1._id,
        userId: user1._id,
        changes: {
          title: task1.title,
          priority: task1.priority,
        },
      },
      {
        action: "CREATE",
        entityType: "TASK",
        entityId: task2._id,
        userId: user1._id,
        changes: {
          title: task2.title,
          priority: task2.priority,
        },
      },
      {
        action: "UPDATE",
        entityType: "TASK",
        entityId: task5._id,
        userId: user1._id,
        changes: {
          status: {
            old: "in_progress",
            new: "done",
          },
        },
      },
    ];

    await Audit.insertMany(auditLogs);
    logger.info(`✅ Created ${auditLogs.length} audit logs`);

    logger.info("✅ Database seeding completed successfully!");
    logger.info(`
📊 Seeding Summary:
  ├─ Users: 3 (demo@example.com, jane@example.com, admin@example.com)
  ├─ Tasks: 7 (for demo@example.com and jane@example.com)
  ├─ Audit Logs: ${auditLogs.length}
  └─ Password for all users: Password123 (or AdminPass123 for admin)
    `);

    logger.info(`
Demo Credentials:
  ├─ Email: demo@example.com
  ├─ Password: Password123
  └─ URL: http://localhost:5173
    `);

    process.exit(0);
  } catch (error) {
    logger.error(error, "Database seeding failed");
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
