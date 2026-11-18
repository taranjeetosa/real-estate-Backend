import { rateLimit } from "express-rate-limit";
export const enquiryRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skip: () => process.env.NODE_ENV === "test",
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json({
      ok: false,
      message: "Too many attempts, please try again later.",
    }),
});
