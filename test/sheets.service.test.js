import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  spreadsheetGet: vi.fn(),
  valuesGet: vi.fn(),
  valuesUpdate: vi.fn(),
  valuesAppend: vi.fn(),
}));

vi.mock("googleapis", () => ({
  google: {
    auth: { GoogleAuth: vi.fn() },
    sheets: vi.fn(() => ({
      spreadsheets: {
        get: mocks.spreadsheetGet,
        values: {
          get: mocks.valuesGet,
          update: mocks.valuesUpdate,
          append: mocks.valuesAppend,
        },
      },
    })),
  },
}));

import {
  appendEnquiryToSheet,
  updateSheetConfirmation,
} from "../src/services/sheets.service.js";

beforeEach(() => {
  vi.stubEnv("GOOGLE_SHEET_ID", "test-sheet");
  vi.stubEnv("GOOGLE_SHEET_TAB", "Leads");
  mocks.spreadsheetGet.mockResolvedValue({
    data: { sheets: [{ properties: { title: "Leads" } }] },
  });
  mocks.valuesGet.mockResolvedValue({ data: { values: [["Submitted At"]] } });
  mocks.valuesUpdate.mockResolvedValue({});
  mocks.valuesAppend.mockResolvedValue({
    data: { updates: { updatedRange: "Leads!A42:H42" } },
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("Google Sheets enquiry delivery status", () => {
  it.each([
    "Leads!A42:H42",
    "'Leads Tab'!A42:H42",
    "Leads!$A$42:$H$42",
    "A42:H42",
  ])("extracts the row from updated range %s and writes confirmation status", async (updatedRange) => {
    mocks.valuesAppend.mockResolvedValue({
      data: { updates: { updatedRange } },
    });
    const result = await appendEnquiryToSheet({
      name: "Alex Morgan",
      phone: "9876543210",
      email: "alex@example.com",
      pathway: "AI for Real Estate Professional",
      source: "curriculum-download",
    });

    expect(result).toEqual({ row: 42 });
    expect(mocks.valuesAppend.mock.calls[0][0].requestBody.values[0][6]).toBe(
      "Curriculum download",
    );

    await updateSheetConfirmation(result.row, "Sent");

    expect(mocks.valuesUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        range: "Leads!H42",
        requestBody: { values: [["Sent"]] },
      }),
    );
  });
});
