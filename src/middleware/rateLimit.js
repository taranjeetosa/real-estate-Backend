import { rateLimit } from "express-rate-limit";
import { logger } from "../utils/logger.js";
export const enquiryRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skip: () => process.env.NODE_ENV === "test",
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(
      { requestId: req.requestId, route: "/api/enquiries" },
      "Enquiry request rate limited",
    );
    res.status(429).json({
      ok: false,
      message: "Too many attempts, please try again later.",
    });
  },
});
