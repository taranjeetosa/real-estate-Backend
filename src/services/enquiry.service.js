import crypto from "crypto";
import Enquiry from "../models/Enquiry.js";
import { appendEnquiryToSheet, updateSheetConfirmation } from "./sheets.service.js";
import { sendMail } from "./mail.service.js";
import { buildUserConfirmation } from "../emails/userConfirmation.js";
export function hashIp(ip) {
  return ip ? crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16) : "";
}
export async function hasRecentSentConfirmation(email) {
  return Enquiry.exists({
    email: email.toLowerCase(),
    "delivery.confirmationEmail.state": "sent",
    "delivery.confirmationEmail.at": { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) },
  });
}
export async function processEnquiry(e) {
  if (!e.delivery.sheet.row) {
    e.delivery.sheet.attempts++;
    try {
      const r = await appendEnquiryToSheet(e);
      e.delivery.sheet.row = r.row;
      e.delivery.sheet.state = "sent";
      e.delivery.sheet.error = undefined;
      e.delivery.sheet.at = new Date();
    } catch (x) {
      e.delivery.sheet.state = "failed";
      e.delivery.sheet.error = x.message || "Google Sheets sync failed";
      e.delivery.sheet.at = new Date();
    }
  }
  if (
    e.delivery.confirmationEmail.state !== "sent" &&
    e.delivery.confirmationEmail.state !== "skipped"
  ) {
    if (await hasRecentSentConfirmation(e.email)) {
      e.delivery.confirmationEmail.state = "skipped";
      e.delivery.confirmationEmail.error = "already sent recently";
      e.delivery.confirmationEmail.at = new Date();
    } else {
      e.delivery.confirmationEmail.attempts++;
      const c = buildUserConfirmation(e);
      try {
        const r = await sendMail({
          to: e.email,
          subject: c.subject,
          html: c.html,
          text: c.text,
          replyTo: process.env.MAIL_REPLY_TO,
        });
        if (r.error) throw new Error(r.error.message || "Resend returned an error");
        e.delivery.confirmationEmail.state = "sent";
        e.delivery.confirmationEmail.error = undefined;
        e.delivery.confirmationEmail.providerId = r.data?.id;
        e.delivery.confirmationEmail.at = new Date();
      } catch (x) {
        e.delivery.confirmationEmail.state = "failed";
        e.delivery.confirmationEmail.error = x.message || "Email delivery failed";
        e.delivery.confirmationEmail.at = new Date();
      }
    }
  }
  if (e.delivery.sheet.row) {
    const reason =
      e.delivery.confirmationEmail.state === "sent"
        ? "Sent"
        : e.delivery.confirmationEmail.state === "skipped"
          ? `Skipped: ${e.delivery.confirmationEmail.error || "already sent recently"}`
          : `Failed: ${e.delivery.confirmationEmail.error || "email delivery failed"}`;
    try {
      await updateSheetConfirmation(e.delivery.sheet.row, reason);
    } catch (error) {
      e.delivery.sheet.error = error.message || "Unable to update sheet confirmation";
    }
  }
  await e.save();
}
