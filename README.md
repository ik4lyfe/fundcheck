# FundCheck — Fundamental Analysis Tool

A minimalist web app for systematic stock fundamental analysis using the WealthFort checklist.

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | View & filter saved entries |
| Business | `/business` | Qualitative: 10 business criteria (1-5 each, max 50) |
| Management | `/management` | Qualitative: 10 management criteria (1-5 each, max 50) |
| Quantitative | `/quantitative` | 7-step financial health check with auto-CAGR calculations |

## Setup

### Prerequisites
- Node.js 18+
- A Google Cloud Project with Sheets API enabled

### 1. Google Cloud Setup (5 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. **Enable** the Google Sheets API
4. Go to **IAM & Admin → Service Accounts**
5. Click **Create Service Account** → name it "fundcheck"
6. Click **Done** (no need to grant roles)
7. Click on the service account → **Keys** → **Add Key** → **Create New Key**
8. Choose **JSON** → download the file
9. Save it as `service-account-key.json` in this directory

### 2. Create Spreadsheet

```bash
node setup-sheets.js --keyfile=./service-account-key.json
```

This creates the spreadsheet, sets up 3 tabs with headers, and outputs the `.env.local` config.

### 3. Configure Environment

Copy the output from setup-sheets.js, or create `.env.local`:

```bash
GOOGLE_SHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...full json...}'
```

### 4. Run

```bash
npm run dev
# or
npm run build && npm start
```

## Data Structure

### Qualitative Business (max 50)
Products & Services, Market Size, Margin, Competitive Edge, Growth, Business Model, Sustainability, Industry Nature, Competition, Risks

### Qualitative Management (max 50)
Owners, Board of Directors, Management Competence, Management Integrity, Corporate Governance, Shareholder Consideration, Executive Compensation, Staff Recognition, Corporate Actions, Auditor Figures

### Quantitative
Revenue CAGR (5yr), EPS CAGR (5yr), OCF History, Current Ratio, D/E Ratio, Dividend Yield, Valuation Score

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS v4
- Google Sheets API (database)
- Deployed on Ubuntu VPS
