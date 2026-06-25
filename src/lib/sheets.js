import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

function getAuth() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getRange(tab) {
  if (tab === 'business') return 'Business!A2:N';
  if (tab === 'management') return 'Management!A2:N';
  if (tab === 'quantitative') return 'Quantitative!A2:T';
  return 'Business!A2:N';
}

function getHeaders(tab) {
  if (tab === 'business') {
    return [
      'ID', 'Date', 'Counter',
      'Products & Services', 'Market Size', 'Margin', 'Competitive Edge',
      'Growth', 'Business Model', 'Sustainability', 'Industry Nature',
      'Competition', 'Risks', 'Total Score'
    ];
  }
  if (tab === 'management') {
    return [
      'ID', 'Date', 'Counter',
      'Owners', 'Board of Directors', 'Management Competence', 'Management Integrity',
      'Corporate Governance', 'Shareholder Consideration', 'Executive Compensation',
      'Staff Recognition & Retention', 'Corporate Actions', 'Auditor Figures', 'Total Score'
    ];
  }
  if (tab === 'quantitative') {
    return [
      'ID', 'Date', 'Counter',
      'Revenue 5yr Ago', 'Revenue Current', 'Revenue CAGR',
      'EPS 5yr Ago', 'EPS Current', 'EPS CAGR',
      'OCF Years',
      'Current Assets', 'Current Liabilities', 'Current Ratio',
      'Total Liabilities', 'Total Equity', 'D/E Ratio',
      'DPS', 'Share Price', 'Dividend Yield',
      'Valuation Score', 'Notes'
    ];
  }
  return [];
}

export async function getEntries(tab = 'business') {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const range = getRange(tab);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });

    const rows = res.data.values || [];
    const headers = getHeaders(tab);

    return rows.map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] || ''; });
      return obj;
    });
  } catch (err) {
    console.error('getEntries error:', err.message);
    return [];
  }
}

export async function addEntry(tab = 'business', data) {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const range = getRange(tab);
    const headers = getHeaders(tab);

    const row = headers.map(h => data[h] || '');
    row[0] = Date.now().toString(); // ID

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    return { success: true };
  } catch (err) {
    console.error('addEntry error:', err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteEntry(tab = 'business', id) {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const range = getRange(tab);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });

    const rows = res.data.values || [];
    const rowIdx = rows.findIndex(row => row[0] === id);
    if (rowIdx === -1) return { success: false, error: 'Not found' };

    // Clear the row
    const clearRange = `${tab === 'business' ? 'Business' : tab === 'management' ? 'Management' : 'Quantitative'}!A${rowIdx + 2}:${String.fromCharCode(64 + getHeaders(tab).length)}${rowIdx + 2}`;

    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: clearRange,
    });

    return { success: true };
  } catch (err) {
    console.error('deleteEntry error:', err.message);
    return { success: false, error: err.message };
  }
}
