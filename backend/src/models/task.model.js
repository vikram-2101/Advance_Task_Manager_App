// src/models/task.model.js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title must be less than 200 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [2000, "Description must be less than 2000 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["todo", "in_progress", "done"],
        message: "Invalid status. Must be one of: todo, in_progress, done",
      },
      default: "todo",
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Invalid priority. Must be one of: low, medium, high",
      },
      default: "medium",
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => v.every((tag) => tag.length > 0 && tag.length <= 50),
        message: "Each tag must be between 1 and 50 characters",
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task owner is required"],
      index: true,
    },
    sharedWith: {
      type: [
        {
          userId: mongoose.Schema.Types.ObjectId,
          permission: {
            type: String,
            enum: ["view", "edit", "admin"],
            default: "view",
          },
        },
      ],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "tasks", timestamps: true },
);

// Compound index for efficient querying
taskSchema.index({ owner: 1, isDeleted: 1, status: 1 });
taskSchema.index({ owner: 1, isDeleted: 1, dueDate: 1 });
taskSchema.index({ tags: 1, isDeleted: 1 });

// Query middleware to exclude soft-deleted tasks by default
taskSchema.pre(/^find/, function () {
  if (!this.options.includeDeleted) {
    this.where({ isDeleted: false });
  }
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
