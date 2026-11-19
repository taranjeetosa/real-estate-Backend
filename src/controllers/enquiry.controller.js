import Enquiry from "../models/Enquiry.js";
import { processEnquiry, hashIp } from "../services/enquiry.service.js";
import { logger } from "../utils/logger.js";
export async function createEnquiry(req, res, next) {
  try {
    const v = req.validated;
    const e = await Enquiry.create({
      ...v,
      whatsappNumber: v.countryCode ? `${v.countryCode} ${v.phone}` : undefined,
      ip: hashIp(req.ip),
      userAgent: req.get("user-agent")?.slice(0, 500),
      delivery: {
        sheet: { state: "pending", attempts: 0 },
        confirmationEmail: { state: "pending", attempts: 0 },
      },
    });
    await processEnquiry(e);
    logger.info(
      {
        requestId: req.requestId,
        enquiryId: e.id,
        source: e.source,
        sheetState: e.delivery.sheet.state,
        confirmationEmailState: e.delivery.confirmationEmail.state,
      },
      "Enquiry processed",
    );
    return res.status(201).json({ ok: true, message: "Your enquiry was received." });
  } catch (error) {
    next(error);
  }
}
