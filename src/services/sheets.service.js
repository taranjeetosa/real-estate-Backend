import { google } from "googleapis";
export function formulaGuard(v) {
  const t = String(v);
  return /^[=+\-@]/.test(t) ? `'${t}` : t;
}
function getClient() {
  return google.sheets({
    version: "v4",
    auth: new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    }),
  });
}
export async function appendEnquiryToSheet(e) {
  if (!process.env.GOOGLE_SHEET_ID) throw new Error("Google Sheets is not configured");
  const sheets = getClient();
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
  });
  const title =
    process.env.GOOGLE_SHEET_TAB || metadata.data.sheets?.[0]?.properties?.title;
  if (!title) throw new Error("Google Sheet tab was not found");
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${title}!A1:H`,
  });
  const values = existing.data.values || [];
  const headers = [
    "Submitted At",
    "Full Name",
    "WhatsApp Number",
    "Email Address",
    "Learning Pathway",
    "Preferred Contact Time",
    "Source",
    "Confirmation Email",
  ];
  if (!values.length)
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${title}!A1:H1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [headers] },
    });
  else if (values[0].length === 7)
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${title}!H1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [["Confirmation Email"]] },
    });
  const row = [
    formulaGuard(
      e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString(),
    ),
    formulaGuard(e.name),
    formulaGuard(e.whatsappNumber || e.phone),
    formulaGuard(e.email),
    formulaGuard(e.pathway),
    formulaGuard(e.preferredTime || ""),
    formulaGuard(e.source === "lead-popup" ? "Lead popup" : "Show Interest form"),
    "",
  ];
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${title}!A:H`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
  const match = /!H?(\d+)(?::|$)/.exec(response.data.updatedRange || "");
  if (!match) throw new Error("Google Sheets did not return a row number");
  return { row: Number(match[1]) };
}
export async function updateSheetConfirmation(row, state) {
  if (!process.env.GOOGLE_SHEET_ID) throw new Error("Google Sheets is not configured");
  const sheets = getClient();
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
  });
  const title =
    process.env.GOOGLE_SHEET_TAB || metadata.data.sheets?.[0]?.properties?.title;
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${title}!H${row}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[state]] },
  });
}
