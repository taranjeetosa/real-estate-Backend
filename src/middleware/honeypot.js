import { logger } from "../utils/logger.js";

export function honeypot(req, res, next) {
  if (typeof req.body?.website === "string" && req.body.website.trim()) {
    logger.warn(
      { requestId: req.requestId, route: "/api/enquiries" },
      "Honeypot submission blocked",
    );
    return res.status(400).json({ ok: false, message: "Unable to submit this enquiry." });
  }
  next();
}
