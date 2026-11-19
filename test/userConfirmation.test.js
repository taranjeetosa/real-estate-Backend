import { afterEach, describe, expect, it, vi } from "vitest";
import { buildUserConfirmation } from "../src/emails/userConfirmation.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("user confirmation email", () => {
  it("uses the current app origin for the project logo", () => {
    vi.stubEnv(
      "ALLOWED_ORIGINS",
      "http://localhost:5173, https://real-estate.example",
    );

    const { html } = buildUserConfirmation({
      name: "Alex Morgan",
      pathway: "AI for Real Estate Professional",
      phone: "9876543210",
    });

    expect(html).toContain(
      'src="https://real-estate.example/logo-brand.png"',
    );
    expect(html).toContain('alt="One Stock Academy"');
    expect(html).not.toContain("onestockacademy.com");
  });

  it("shows a brand name fallback when no HTTPS app origin is configured", () => {
    vi.stubEnv("ALLOWED_ORIGINS", "http://localhost:5173");

    const { html } = buildUserConfirmation({
      name: "Alex Morgan",
      pathway: "AI for Real Estate Professional",
      phone: "9876543210",
    });

    expect(html).toContain("One Stock Academy");
    expect(html).not.toContain("<img");
  });
});
