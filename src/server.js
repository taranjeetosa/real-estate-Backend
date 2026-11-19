import { loadEnv } from "./config/env.js";
import { connectDatabase } from "./db/connect.js";
import { createApp } from "./app.js";
import { logger } from "./utils/logger.js";
import mongoose from "mongoose";
import { performance } from "node:perf_hooks";

const env = loadEnv();

async function startServer() {
  await connectDatabase(env.MONGODB_URI);
  logger.info({ database: mongoose.connection.name }, "MongoDB connected");

  const server = createApp(env).listen(env.PORT);
  await new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      server.off("error", onError);
      resolve();
    };
    server.once("error", onError);
    server.once("listening", onListening);
  });

  const address = server.address();
  logger.info(
    { port: typeof address === "object" && address ? address.port : env.PORT },
    "HTTP server listening",
  );
  server.on("error", (error) => logger.error({ err: error }, "HTTP server error"));

  let shuttingDown = false;
  async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    const startedAt = performance.now();
    logger.info({ signal }, "Graceful shutdown started");

    const timeout = setTimeout(() => {
      logger.fatal({ signal, timeoutMs: 10000 }, "Graceful shutdown timed out");
      server.closeAllConnections();
      mongoose.disconnect().catch((error) => {
        logger.error({ err: error }, "MongoDB disconnect failed during forced shutdown");
      });
      process.exitCode = 1;
    }, 10000);
    timeout.unref();

    server.close(async (error) => {
      if (error) {
        logger.error({ err: error }, "HTTP server shutdown failed");
        process.exitCode = 1;
      }
      try {
        await mongoose.disconnect();
      } catch (disconnectError) {
        logger.error({ err: disconnectError }, "MongoDB disconnect failed");
        process.exitCode = 1;
      }
      clearTimeout(timeout);
      logger.info(
        { signal, durationMs: Number((performance.now() - startedAt).toFixed(2)) },
        "Graceful shutdown completed",
      );
    });
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

process.on("uncaughtExceptionMonitor", (error) => {
  logger.fatal({ err: error }, "Uncaught exception");
});

startServer().catch((error) => {
  logger.fatal({ err: error }, "Backend startup failed");
  process.exitCode = 1;
});
