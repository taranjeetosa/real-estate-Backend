import { escapeHtml } from "./escapeHtml.js";
export function buildUserConfirmation(e) {
  const name = e.name.trim().split(/\s+/)[0] || e.name;
  const first = escapeHtml(name);
  const path = escapeHtml(e.pathway);
  const wa = escapeHtml(e.whatsappNumber || e.phone);
  const subject = "We've received your enquiry - One Stock Academy";
  const next = e.preferredTime
    ? "One Stock Academy will contact you during your preferred time window."
    : "The One Stock Academy team will be in touch with you.";
  const text = [
    "Hi " + name.replace(/[\r\n]/g, " "),
    "",
    "Thanks for your interest in One Stock Academy.",
    next,
    "",
    "Your enquiry",
    `Learning pathway: ${e.pathway}`,
    `WhatsApp number: ${e.whatsappNumber || e.phone}`,
    ...(e.preferredTime ? [`Preferred contact time: ${e.preferredTime}`] : []),
    "",
    "If any of these details are wrong, just reply to this email or message us on WhatsApp.",
    "",
    "Phone: +91 95990 37181",
    "WhatsApp: https://wa.me/919599037181",
    "Email: support@onestockacadmemy.com",
    "Address: Floor-01, H Block, H-189, Sector 63, Noida, Uttar Pradesh 201309",
    "",
    "You are receiving this email because you submitted an enquiry on the One Stock Academy website.",
  ].join("\n");
  const preferred = e.preferredTime
    ? `<tr><td style="padding:5px 12px;"><strong>Preferred contact time:</strong> ${escapeHtml(e.preferredTime)}</td></tr>`
    : "";
  const html = `<!doctype html><html><body style="margin:0;background:#f3f5f7;font-family:Arial,sans-serif;color:#080808;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f5f7;padding:24px 12px;"><tr><td align="center"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;"><tr><td style="background:#244ed8;padding:24px;color:#fff;font-size:22px;font-weight:700;">One Stock Academy</td></tr><tr><td style="padding:32px 28px;"><p>Hi ${first},</p><p>Thanks for your interest in One Stock Academy.</p><p>${escapeHtml(next)}</p><table role="presentation" width="100%" cellspacing="0" cellpadding="8" style="background:#f3f5f7;border-radius:8px;"><tr><td><strong>Your enquiry</strong></td></tr><tr><td><strong>Learning pathway:</strong> ${path}</td></tr><tr><td><strong>WhatsApp number:</strong> ${wa}</td></tr>${preferred}</table><p>If any of these details are wrong, just reply to this email or message us on WhatsApp.</p><div style="margin-top:24px;padding-top:18px;border-top:1px solid #e5e7eb;line-height:1.7;"><strong>Phone:</strong> <a href="tel:+919599037181">+91 95990 37181</a><br><strong>WhatsApp:</strong> <a href="https://wa.me/919599037181">https://wa.me/919599037181</a><br><strong>Email:</strong> <a href="mailto:support@onestock.com">support@onestock.com</a><br><strong>Address:</strong> Floor-01, H Block, H-189, Sector 63, Noida, Uttar Pradesh 201309</div></td></tr></table><p style="max-width:600px;font-size:12px;color:#666;">You are receiving this email because you submitted an enquiry on the One Stock Academy website.</p></td></tr></table></body></html>`;
  return { subject: subject.replace(/[\r\n]/g, " "), html, text };
}
