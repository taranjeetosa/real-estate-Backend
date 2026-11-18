import { z } from "zod";
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string().min(1),
  ALLOWED_ORIGINS: z.string().default(""),
  GOOGLE_SHEET_ID: z.string().optional(),
  GOOGLE_SHEET_TAB: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().optional(),
  MAIL_REPLY_TO: z.string().optional(),
});
export function loadEnv() {
  const r = schema.safeParse(process.env);
  if (!r.success)
    throw new Error(
      `Invalid environment: ${r.error.issues.map((x) => x.message).join(", ")}`,
    );
  r.data.allowedOrigins = r.data.ALLOWED_ORIGINS.split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  if (r.data.NODE_ENV !== "production")
    r.data.allowedOrigins.push("http://localhost:5173");
  r.data.GOOGLE_PRIVATE_KEY = r.data.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  return r.data;
}
