import { loadEnv } from "../config/env.js";
import { connectDatabase } from "../db/connect.js";
import mongoose from "mongoose";
import Enquiry from "../models/Enquiry.js";
import { processEnquiry } from "../services/enquiry.service.js";
import { logger } from "../utils/logger.js";
const env = loadEnv();
await connectDatabase(env.MONGODB_URI);
const items = await Enquiry.find({
  $or: [
    { "delivery.sheet.state": { $in: ["failed", "pending"] } },
    { "delivery.confirmationEmail.state": { $in: ["failed", "pending"] } },
  ],
}).limit(500);
for (const e of items) {
  if (
    (e.delivery.sheet.attempts >= 5 && e.delivery.sheet.state !== "sent") ||
    (e.delivery.confirmationEmail.attempts >= 5 &&
      e.delivery.confirmationEmail.state !== "sent")
  )
    continue;
  await processEnquiry(e);
  logger.info({ enquiryId: e.id }, "Retry processed");
}
await mongoose.disconnect();
