import { Resend } from "resend";
export function sendMail({ to, subject, html, text, replyTo }) {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({
    from: process.env.MAIL_FROM,
    to,
    replyTo,
    subject: String(subject).replace(/[\r\n]/g, " "),
    html,
    text,
  });
}
