import pino from "pino";

const LOG_LEVELS = new Set([
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
]);
const defaultLevel = process.env.NODE_ENV === "test" ? "silent" : "info";
const configuredLevel = process.env.LOG_LEVEL;
const level = LOG_LEVELS.has(configuredLevel) ? configuredLevel : defaultLevel;

function redactSensitiveText(value) {
  let text = String(value || "");

  for (const key of ["MONGODB_URI", "SENDER_API_KEY", "GOOGLE_PRIVATE_KEY"]) {
    const secret = process.env[key];
    if (secret && secret.length >= 6) text = text.split(secret).join("[REDACTED_SECRET]");
  }

  return text
    .replace(/mongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi, "[REDACTED_MONGODB_URI]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]")
    .replace(/\+?\d[\d \t().-]{8,}\d/g, "[REDACTED_PHONE]")
    .replace(/(Bearer\s+)[^\s]+/gi, "$1[REDACTED]")
    .replace(
      /(password|token|secret|api[_-]?key)\s*[:=]\s*([^\s,;]+)/gi,
      "$1=[REDACTED]",
    );
}

function serializeError(error) {
  const serialized = pino.stdSerializers.err(error);
  if (!serialized) return { type: "Error", message: "Unknown error" };

  return {
    type: serialized.type,
    message: redactSensitiveText(serialized.message).slice(0, 1000),
    stack: redactSensitiveText(serialized.stack).slice(0, 5000),
    ...(error.code !== undefined ? { code: String(error.code).slice(0, 100) } : {}),
  };
}

export const logger = pino({
  level,
  base: {
    service: "one-stock-academy-backend",
    environment: process.env.NODE_ENV || "development",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "req.body",
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers.x-forwarded-for",
      "req.headers.x-real-ip",
      "req.headers.x-api-key",
      "email",
      "phone",
      "whatsappNumber",
      "ip",
    ],
    censor: "[REDACTED]",
  },
  serializers: { err: serializeError },
});

export { redactSensitiveText };
