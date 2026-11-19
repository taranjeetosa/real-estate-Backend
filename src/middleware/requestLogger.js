import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { logger } from "../utils/logger.js";

export function requestLogger(req, res, next) {
  const requestId = randomUUID();
  const startedAt = performance.now();

  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  res.once("finish", () => {
    const statusCode = res.statusCode;
    const fields = {
      requestId,
      method: req.method,
      route: req.route?.path ? `${req.baseUrl}${req.route.path}` : "unmatched",
      statusCode,
      responseTimeMs: Number((performance.now() - startedAt).toFixed(2)),
    };

    if (statusCode >= 500) logger.error(fields, "HTTP request completed");
    else if (statusCode >= 400) logger.warn(fields, "HTTP request completed");
    else if (req.path === "/health") logger.debug(fields, "HTTP request completed");
    else logger.info(fields, "HTTP request completed");
  });

  next();
}
