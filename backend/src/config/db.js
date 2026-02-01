// src/config/db.js
import mongoose from "mongoose";
import { env } from "./env.js";
import logger from "../utils/logger.js";

const connectDB = async () => {
  console.log(env.MONGODB_URI);
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info({ host: conn.connection.host }, "MongoDB Connected");
    return conn;
  } catch (error) {
    logger.error(error, "MongoDB Connection Error");
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB Disconnected");
  } catch (error) {
    logger.error(error, "MongoDB Disconnection Error");
    process.exit(1);
  }
};

export { connectDB, disconnectDB };
