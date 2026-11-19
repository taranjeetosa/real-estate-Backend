import { escapeHtml } from "./escapeHtml.js";

// Theme tokens taken from the website redesign
const C = {
  black: "#080808",
  panel: "#111216",
  blue: "#244ed8",
  blueLight: "#1677ff",
  accent: "#1677ff",
  bg: "#f9f9f9",
  card: "#ffffff",
  text: "#080808",
  muted: "#5f5f5f",
  line: "#e3e3e3",
  tint: "#eaf3ff",
};
const FONT = "'DM Sans','Segoe UI',Helvetica,Arial,sans-serif";
const HEADING_FONT = "'Manrope','DM Sans','Segoe UI',Helvetica,Arial,sans-serif";

function getProjectOrigin() {
  return String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .find((origin) => /^https:\/\/[^/?#]+$/i.test(origin));
}

export function buildUserConfirmation(e) {
  const name = e.name.trim().split(/\s+/)[0] || e.name;
  const first = escapeHtml(name);
  const path = escapeHtml(e.pathway);
  const waRaw = e.whatsappNumber || e.phone;
  const wa = escapeHtml(waRaw);
  const projectOrigin = getProjectOrigin();
  const logo = projectOrigin
    ? `<a href="${escapeHtml(projectOrigin)}" style="display:inline-block;text-decoration:none;"><img src="${escapeHtml(`${projectOrigin}/logo-brand.png`)}" width="240" alt="One Stock Academy" style="display:block;width:240px;max-width:100%;height:auto;border:0;"></a>`
    : `<span style="font-family:${HEADING_FONT};font-size:22px;font-weight:700;color:#fff;">One Stock Academy</span>`;
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
    `WhatsApp number: ${waRaw}`,
    ...(e.preferredTime ? [`Preferred contact time: ${e.preferredTime}`] : []),
    "",
    "If any of these details are wrong, just reply to this email or message us on WhatsApp.",
    "",
    "Phone: +91 95990 37181",
    "WhatsApp: https://wa.me/919599037181",
    "Email: support@onestock.com",
    "Address: Floor-01, H Block, H-189, Sector 63, Noida, Uttar Pradesh 201309",
    "",
    "You are receiving this email because you submitted an enquiry on the One Stock Academy website.",
  ].join("\n");

  const row = (label, value, last) =>
    `<tr><td style="padding:14px 0;${last ? "" : `border-bottom:1px solid ${C.line};`}">
      <div style="font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:${C.blue};font-weight:600;">${label}</div>
      <div style="font-size:15px;color:${C.text};font-weight:600;padding-top:4px;">${value}</div>
    </td></tr>`;

  const rows = [
    row("Learning pathway", path, false),
    row("WhatsApp number", wa, !e.preferredTime),
    e.preferredTime
      ? row("Preferred contact time", escapeHtml(e.preferredTime), true)
      : "",
  ].join("");

  const contact = (label, inner) =>
    `<tr><td style="padding:5px 0;font-size:13px;line-height:1.6;color:#a1a1a1;"><span style="color:#fff;font-weight:600;">${label}</span>&nbsp;&nbsp;${inner}</td></tr>`;
  const link = (href, label) =>
    `<a href="${href}" style="color:${C.blueLight};text-decoration:none;">${label}</a>`;

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:${FONT};color:${C.text};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">We've got your enquiry for ${path}. ${escapeHtml(next)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${C.bg};padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;background:${C.card};">

  <!-- Header -->
  <tr><td style="background:${C.black};padding:22px 32px;border-bottom:1px solid #1f2128;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
      <td>${logo}</td>
      <td align="right"><a href="https://wa.me/919599037181" style="display:inline-block;background:${C.blue};color:#fff;font-size:12px;font-weight:600;text-decoration:none;padding:9px 16px;border-radius:8px;">Chat on WhatsApp &rarr;</a></td>
    </tr></table>
  </td></tr>

  <!-- Hero -->
  <tr><td style="background:${C.black};padding:40px 32px 44px;">
    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.accent};font-weight:600;">Real estate career in Dubai</div>
    <div style="font-family:${HEADING_FONT};font-size:34px;line-height:1.15;font-weight:700;color:#fff;padding-top:14px;letter-spacing:-0.8px;">Your enquiry<br>is <span style="color:${C.blueLight};">received.</span></div>
    <div style="font-size:15px;line-height:1.65;color:#a1a1a1;padding-top:16px;">Hi ${first}, thanks for your interest in One Stock Academy. ${escapeHtml(next)}</div>
  </td></tr>

  <!-- Enquiry details -->
  <tr><td style="padding:32px 32px 8px;">
    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.blue};font-weight:600;">Your enquiry</div>
    <div style="font-family:${HEADING_FONT};font-size:22px;font-weight:700;letter-spacing:-0.4px;padding-top:6px;">What we have <span style="color:${C.blue};">noted.</span></div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;">${rows}</table>
  </td></tr>

  <!-- Note -->
  <tr><td style="padding:16px 32px 32px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
      <td width="4" style="background:${C.blue};border-radius:2px;"></td>
      <td style="background:${C.tint};padding:14px 16px;font-size:13px;line-height:1.6;color:${C.text};">If any of these details are wrong, just reply to this email or message us on WhatsApp.</td>
    </tr></table>
  </td></tr>

  <!-- Footer / contact -->
  <tr><td style="background:${C.black};padding:30px 32px;">
    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.accent};font-weight:600;padding-bottom:10px;">Reach us</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${contact("Phone", link("tel:+919599037181", "+91 95990 37181"))}
      ${contact("WhatsApp", link("https://wa.me/919599037181", "Chat on WhatsApp"))}
      ${contact("Email", link("mailto:support@onestock.com", "support@onestock.com"))}
      ${contact("Address", "Floor-01, H Block, H-189, Sector 63, Noida, Uttar Pradesh 201309")}
    </table>
  </td></tr>
</table>
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;"><tr><td style="padding:16px 8px;font-size:12px;line-height:1.5;color:#8a8f9b;text-align:center;">You are receiving this email because you submitted an enquiry on the One Stock Academy website.</td></tr></table>
</td></tr></table>
</body></html>`;

  return { subject: subject.replace(/[\r\n]/g, " "), html, text };
}
