// src/utils/logger.js
import pino from "pino";
import { env } from "../config/env.js";

const isProduction = env.NODE_ENV === "production";

const logger = pino({
  level: env.LOG_LEVEL,
  ...(isProduction
    ? {
        formatters: {
          level: (label) => {
            return { level: label.toUpperCase() };
          },
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
            singleLine: false,
          },
        },
      }),
});

export default logger;
