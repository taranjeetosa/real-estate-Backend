import { loadEnv } from "./config/env.js";
import { connectDatabase } from "./db/connect.js";
import { createApp } from "./app.js";
import { logger } from "./utils/logger.js";
import mongoose from "mongoose";
const env = loadEnv();
await connectDatabase(env.MONGODB_URI);
const app = createApp(env);
const server = app.listen(env.PORT, () =>
  logger.info({ port: env.PORT }, "Server started"),
);
async function shutdown(signal) {
  logger.info({ signal }, "Shutting down");
  server.close(async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
