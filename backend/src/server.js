// src/server.js
import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import app from "./app.js";
import logger from "./utils/logger.js";

const PORT = env.PORT;
let server;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    server = app.listen(PORT, () => {
      logger.info({ port: PORT, env: env.NODE_ENV }, "Server started");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      logger.info("SIGINT signal received: closing HTTP server");
      server.close(async () => {
        logger.info("HTTP server closed");
        await disconnectDB();
        process.exit(0);
      });
    });

    process.on("SIGTERM", async () => {
      logger.info("SIGTERM signal received: closing HTTP server");
      server.close(async () => {
        logger.info("HTTP server closed");
        await disconnectDB();
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error(error, "Failed to start server");
    process.exit(1);
  }
};

startServer();

export { app, server };
