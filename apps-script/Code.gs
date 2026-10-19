const SPREADSHEET_ID = '10APFgKU7dhNcBNrsuBBxZT2iZjhpNkeG5e5sFcz_oGU';
const SHEET_NAME = 'Confirmaciones';
const HEADERS = [
  'Fecha de recepción (Madrid)',
  'Nombre y apellidos',
  'Nombre y apellidos del acompañante',
  '¿Vienes con tus hijos?',
  'Servicio de autobús',
  'Alergias, intolerancias o necesidades dietéticas especiales'
];
const BUS_OPTIONS = [
  'Sí, a la ida y a la vuelta',
  'Sí, solo a la ida',
  'Sí, solo a la vuelta',
  'No, iremos por nuestra cuenta'
];

function doPost(e) {
  const data = (e && e.parameter) || {};
  if (String(data.website || '').trim()) return text_('OK');

  const guestName = clean_(data.guestName, 120);
  const companionName = clean_(data.companionName, 120);
  const children = String(data.children || '').trim();
  const busService = String(data.busService || '').trim();
  const dietary = clean_(data.dietary, 1000);

  if (!guestName || !['Sí', 'No'].includes(children) || !BUS_OPTIONS.includes(busService)) {
    return text_('INVALID');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    sheet.appendRow([Utilities.formatDate(new Date(), 'Europe/Madrid', 'dd/MM/yyyy HH:mm:ss'), guestName, companionName, children, busService, dietary]);
  } finally {
    lock.releaseLock();
  }
  return text_('OK');
}

function doGet() {
  return text_('Formulario de confirmación listo.');
}

function clean_(value, maxLength) {
  let text = String(value || '').trim().slice(0, maxLength);
  // Evita que texto enviado por un usuario se interprete como fórmula en Sheets.
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return text;
}

function text_(value) {
  return ContentService.createTextOutput(value).setMimeType(ContentService.MimeType.TEXT);
}
