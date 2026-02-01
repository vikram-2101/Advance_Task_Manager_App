// src/models/audit.model.js
import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGIN_FAILURE"],
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ["TASK", "USER"],
      required: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
      // ❌ REMOVE index: true
    },
  },
  { collection: "audits", timestamps: false },
);

// ✅ TTL Index - auto-delete audit logs after 90 days
auditSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const Audit = mongoose.model("Audit", auditSchema);
export default Audit;
