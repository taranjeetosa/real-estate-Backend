import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { logger, redactSensitiveText } from "../src/utils/logger.js";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("production logging", () => {
  it("returns a request ID and logs validation metadata without lead details", async () => {
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {});
    const app = createApp({ allowedOrigins: [] });
    const response = await request(app)
      .post("/api/enquiries?email=query@example.com")
      .send({ name: "Alex Morgan", email: "private@example.com", phone: "9876543210" })
      .expect(400);

    expect(response.headers["x-request-id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    const serializedCalls = JSON.stringify(warn.mock.calls);
    expect(serializedCalls).toContain(response.headers["x-request-id"]);
    expect(serializedCalls).not.toContain("private@example.com");
    expect(serializedCalls).not.toContain("query@example.com");
    expect(serializedCalls).not.toContain("9876543210");
    expect(serializedCalls).not.toContain("Alex Morgan");
  });

  it("redacts common credentials and personal details in error text", () => {
    vi.stubEnv("SENDER_API_KEY", "sender-secret-token");
    const message = redactSensitiveText(
      "Bearer provider-token used sender-secret-token for alex@example.com at +1 (415) 555-0123",
    );

    expect(message).not.toContain("sender-secret-token");
    expect(message).not.toContain("alex@example.com");
    expect(message).not.toContain("415) 555-0123");
    expect(message).toContain("[REDACTED_SECRET]");
    expect(message).toContain("[REDACTED_EMAIL]");
    expect(message).toContain("[REDACTED_PHONE]");
  });
});
