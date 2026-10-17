/**
 * @OnlyCurrentDoc
 *
 * Receives the note from the website and adds it to this spreadsheet as a row: time, message.
 * Setup: Extensions -> Apps Script, paste this, then Deploy -> New deployment -> Web app
 * (Execute as: Me, Who has access: Anyone) and put the /exec URL into note.endpoint in content/config.js.
 */
const MAX_LENGTH = 2000;

function doPost(e) {
  const params = (e && e.parameter) || {};
  const message = String(params.message || "").trim().slice(0, MAX_LENGTH);
  // Empty, or the hidden spam-trap field was filled in (only bots do that).
  if (!message || params.website) return reply(false);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(["Thời gian", "Tin nhắn"]);
  // A leading = + - @ would turn the cell into a formula ("=))" is a common smiley), so keep it as text.
  sheet.appendRow([new Date(), /^[=+\-@]/.test(message) ? "'" + message : message]);
  return reply(true);
}

function reply(ok) {
  return ContentService.createTextOutput(JSON.stringify({ ok: ok })).setMimeType(ContentService.MimeType.JSON);
}
