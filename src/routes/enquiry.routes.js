import { Router } from "express";
import { enquirySchema } from "../validators/enquiry.schema.js";
import { enquiryRateLimit } from "../middleware/rateLimit.js";
import { honeypot } from "../middleware/honeypot.js";
import { createEnquiry } from "../controllers/enquiry.controller.js";
export const router = Router();
router.get("/health", (_q, r) => r.status(200).json({ status: "ok" }));
router.post(
  "/api/enquiries",
  enquiryRateLimit,
  honeypot,
  (req, _res, next) => {
    const r = enquirySchema.safeParse(req.body);
    if (!r.success) return next(r.error);
    req.validated = r.data;
    next();
  },
  createEnquiry,
);
