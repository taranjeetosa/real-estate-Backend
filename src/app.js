import express from "express";
import helmet from "helmet";
import cors from "cors";
import { router } from "./routes/enquiry.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
export function createApp(env) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(requestLogger);
  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || env.allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error("Origin not allowed"));
      },
    }),
  );
  app.use(express.json({ limit: "10kb" }));
  app.use(router);
  app.use(errorHandler);
  return app;
}
