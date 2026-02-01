// src/config/env.js
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().url("Invalid MongoDB URI"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_EXPIRE: z.string().default("15m"),
  JWT_REFRESH_EXPIRE: z.string().default("7d"),
  BCRYPT_ROUNDS: z.coerce.number().default(10),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  CORS_ORIGIN: z
    .string()
    .default("https://advance-task-manager-app-theta.vercel.app"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  MAX_LOGIN_ATTEMPTS: z.coerce.number().default(5),
  LOCK_TIME_MINUTES: z.coerce.number().default(30),
});

export const env = envSchema.parse(process.env);

export default env;
