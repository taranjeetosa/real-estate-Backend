import { loadEnv } from "../config/env.js";
import { connectDatabase } from "../db/connect.js";
import mongoose from "mongoose";
import Enquiry from "../models/Enquiry.js";
import { processEnquiry } from "../services/enquiry.service.js";
import { logger } from "../utils/logger.js";

const MAX_BATCH_SIZE = 500;

async function retryFailed() {
  const env = loadEnv();
  await connectDatabase(env.MONGODB_URI);

  try {
    const items = await Enquiry.find({
      $or: [
        { "delivery.sheet.state": { $in: ["failed", "pending"] } },
        { "delivery.confirmationEmail.state": { $in: ["failed", "pending"] } },
      ],
    }).limit(MAX_BATCH_SIZE);
    let processed = 0;
    let skipped = 0;

    logger.info(
      { batchSize: items.length, maxBatchSize: MAX_BATCH_SIZE },
      "Failed-delivery retry batch started",
    );

    for (const enquiry of items) {
      if (
        (enquiry.delivery.sheet.attempts >= 5 &&
          enquiry.delivery.sheet.state !== "sent") ||
        (enquiry.delivery.confirmationEmail.attempts >= 5 &&
          enquiry.delivery.confirmationEmail.state !== "sent")
      ) {
        skipped++;
        logger.warn(
          {
            enquiryId: enquiry.id,
            sheetAttempts: enquiry.delivery.sheet.attempts,
            confirmationEmailAttempts: enquiry.delivery.confirmationEmail.attempts,
          },
          "Failed-delivery retry limit reached",
        );
        continue;
      }

      await processEnquiry(enquiry);
      processed++;
      logger.info(
        {
          enquiryId: enquiry.id,
          sheetState: enquiry.delivery.sheet.state,
          confirmationEmailState: enquiry.delivery.confirmationEmail.state,
        },
        "Failed-delivery retry processed",
      );
    }

    logger.info(
      { scanned: items.length, processed, skipped },
      "Failed-delivery retry batch completed",
    );
  } finally {
    await mongoose.disconnect();
  }
}

retryFailed().catch((error) => {
  logger.fatal({ err: error }, "Failed-delivery retry batch failed");
  process.exitCode = 1;
  mongoose.disconnect().catch((disconnectError) => {
    logger.error({ err: disconnectError }, "MongoDB disconnect failed after retry failure");
  });
});
