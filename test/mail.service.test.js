import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendMail } from "../src/services/mail.service.js";

describe("Sender mail service", () => {
  beforeEach(() => {
    vi.stubEnv("SENDER_API_KEY", "sender-test-token");
    vi.stubEnv("MAIL_FROM", "One Stock Academy <enquiries@onestock.com>");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("sends a transactional message using Sender's API format", async () => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ id: "sender-message-id" }), { status: 200 }),
    );

    const result = await sendMail({
      to: "alex@example.com",
      subject: "Hello\r\nInjected",
      html: "<p>Hello</p>",
      text: "Hello",
      replyTo: "support@onestock.com",
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.sender.net/v2/message/send",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer sender-test-token",
        }),
      }),
    );
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      from: { email: "enquiries@onestock.com", name: "One Stock Academy" },
      to: { email: "alex@example.com" },
      subject: "Hello  Injected",
      html: "<p>Hello</p>",
      text: "Hello",
      headers: { "Reply-To": "support@onestock.com" },
    });
    expect(result.data.id).toBe("sender-message-id");
    expect(result.error).toBeNull();
  });

  it("throws Sender's API error when the request is rejected", async () => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ message: "Invalid API token" }), { status: 401 }),
    );

    await expect(
      sendMail({
        to: "alex@example.com",
        subject: "Hello",
        html: "<p>Hello</p>",
        text: "Hello",
      }),
    ).rejects.toThrow("Invalid API token");
  });
});
