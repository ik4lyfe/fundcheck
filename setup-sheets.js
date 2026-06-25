#!/usr/bin/env node

/**
 * FundCheck — Google Sheets Setup
 * 
 * Creates the spreadsheet with 3 tabs and proper headers.
 * Run this AFTER setting up the Google Service Account.
 * 
 * USAGE:
 *   node setup-sheets.js
 * 
 * Prerequisites:
 *   1. GOOGLE_SERVICE_ACCOUNT_KEY env var (JSON string)
 *   2. OR pass --keyfile=path/to/key.json
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function main() {
  // --- Get credentials ---
  let credentials;
  const keyfileArg = process.argv.find(a => a.startsWith('--keyfile='));
  
  if (keyfileArg) {
    const keyPath = keyfileArg.split('=')[1];
    credentials = JSON.parse(fs.readFileSync(path.resolve(keyPath), 'utf8'));
    console.log(`✓ Loaded credentials from ${keyPath}`);
  } else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    console.log('✓ Loaded credentials from GOOGLE_SERVICE_ACCOUNT_KEY env');
  } else {
    console.error('❌ No credentials found.');
    console.error('');
    console.error('   Provide via:');
    console.error('     export GOOGLE_SERVICE_ACCOUNT_KEY=\'{"type":"service_account",...}\'');
    console.error('   Or:');
    console.error('     node setup-sheets.js --keyfile=./service-account-key.json');
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // --- Create spreadsheet ---
  console.log('\n📄 Creating spreadsheet...');
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: 'FundCheck — Fundamental Analysis Database',
      },
      sheets: [
        { properties: { title: 'Business' } },
        { properties: { title: 'Management' } },
        { properties: { title: 'Quantitative' } },
      ],
    },
  });

  const sheetId = spreadsheet.data.spreadsheetId;
  console.log(`✅ Spreadsheet created!`);
  console.log(`   ID: ${sheetId}`);
  console.log(`   URL: https://docs.google.com/spreadsheets/d/${sheetId}`);

  // --- Set headers ---
  const headers = {
    Business: [
      'ID', 'Date', 'Counter',
      'Products & Services', 'Market Size', 'Margin', 'Competitive Edge',
      'Growth', 'Business Model', 'Sustainability', 'Industry Nature',
      'Competition', 'Risks', 'Total Score'
    ],
    Management: [
      'ID', 'Date', 'Counter',
      'Owners', 'Board of Directors', 'Management Competence', 'Management Integrity',
      'Corporate Governance', 'Shareholder Consideration', 'Executive Compensation',
      'Staff Recognition & Retention', 'Corporate Actions', 'Auditor Figures', 'Total Score'
    ],
    Quantitative: [
      'ID', 'Date', 'Counter',
      'Revenue 5yr Ago', 'Revenue Current', 'Revenue CAGR',
      'EPS 5yr Ago', 'EPS Current', 'EPS CAGR',
      'OCF Years',
      'Current Assets', 'Current Liabilities', 'Current Ratio',
      'Total Liabilities', 'Total Equity', 'D/E Ratio',
      'DPS', 'Share Price', 'Dividend Yield',
      'Valuation Score', 'Notes'
    ],
  };

  for (const [tab, cols] of Object.entries(headers)) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${tab}!A1:${String.fromCharCode(64 + cols.length)}1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [cols],
      },
    });
    console.log(`   ✓ ${tab} headers set (${cols.length} columns)`);
  }

  // --- Format header row ---
  const requests = Object.entries(headers).map(([tab, cols], i) => ({
    repeatCell: {
      range: {
        sheetId: i,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: 0,
        endColumnIndex: cols.length,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 },
          textFormat: { bold: true, fontSize: 10 },
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat)',
    },
  }));

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: { requests },
  });
  console.log('   ✓ Header formatting applied');

  // --- Output .env snippet ---
  console.log('\n📝 Add this to your .env.local:');
  console.log('─'.repeat(50));
  console.log(`GOOGLE_SHEET_ID=${sheetId}`);
  console.log(`GOOGLE_SERVICE_ACCOUNT_KEY='${JSON.stringify(credentials)}'`);
  console.log('─'.repeat(50));

  console.log(`\n🔗 ${spreadsheet.data.spreadsheetUrl}`);
  console.log('\n✅ Setup complete!');
}

main().catch((err) => {
  console.error('\n❌ Setup failed:', err.message);
  process.exit(1);
});
