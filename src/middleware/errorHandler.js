import { ZodError } from "zod";
import { logger } from "../utils/logger.js";
export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError)
    return res
      .status(400)
      .json({
        ok: false,
        message: "Please check the provided details.",
        errors: error.issues.map((x) => ({
          field: x.path.join("."),
          message: x.message,
        })),
      });
  logger.error({ err: error }, "Unhandled request error");
  return res
    .status(500)
    .json({
      ok: false,
      message: "We couldn't process your enquiry. Please try again later.",
    });
}
