# Fundamental

> A structured, checklist-based approach to stock fundamental analysis.  
> Evaluate businesses, management teams, and financial health with clarity and confidence.

[**Live App →**](https://funda-analyse.vercel.app)

---

## Overview

**Fundamental** is a web application that guides you through a systematic stock analysis process based on the WealthFort International methodology. Think of it as a digital checklist — rigorous, consistent, and repeatable.

### What It Does

1. **Qualitative Analysis** — Score a company's business model and management team across 20 weighted criteria (max 100)
2. **Quantitative Health Check** — Run a 7-step financial health assessment: revenue growth, earnings quality, liquidity, leverage, dividends, and valuation
3. **Dashboard** — Track all your analyses in one place, review past scores, and export professional PDF reports

---

## Features

- **Google Sign-In** — Click "Start Analysis", sign in with Google, and go. No passwords to remember.
- **Persistent Session** — Server-side session handling means no flicker or redirect loops during navigation.
- **User Menu** — Avatar button always visible in the navbar (profile pic when signed in, person icon when signed out). Sign out from the dropdown.
- **Auto-Fill from Market** — Fetches live financial data from TradingView (P/E, net margin, debt, free cash flow, etc.) — no manual typing needed.
- **Shariah Compliance Badge** — Know at a glance whether a stock is Shariah-compliant (visible during stock selection).
- **Real Bursa Stock Search** — Search from 1,100+ Malaysian-listed stocks via TradingView scanner API.
- **PDF Export** — Generate a comprehensive PDF report covering all analysis sections.
- **Dark Mode** — Light and dark themes, with an animated candlestick chart background that adapts to both.
- **Mobile Responsive** — Hamburger menu on small screens, full nav on desktop.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **Auth** | [Auth.js v5](https://authjs.dev) (Google OAuth) |
| **Database** | [Neon (Vercel Postgres)](https://neon.tech) via [Drizzle ORM](https://orm.drizzle.team) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **Charts & PDF** | jsPDF + jspdf-autotable |
| **Stock Data** | TradingView Scanner API (Bursa Malaysia) |
| **Validation** | Zod |
| **Deployment** | [Vercel](https://vercel.com) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ Landing  │  │ Analysis │  │ Dashboard│  │  PDF   │  │
│  │  Page    │  │  (Auth)  │  │  (Auth)  │  │ Export │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  Next.js API Routes                      │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────┐    │
│  │ /api/auth  │ │ /api/entries│ │ /api/financials  │    │
│  │ (NextAuth) │ │ (CRUD)      │ │ (TV Proxy)       │    │
│  └────────────┘ └─────┬──────┘ └────────┬─────────┘    │
└────────────────────────┼────────────────┼──────────────┘
                         │                │
        ┌────────────────▼──┐    ┌────────▼─────────┐
        │  Vercel Postgres  │    │  TradingView API  │
        │  (Neon) + Drizzle │    │  (Bursa Scanner)  │
        └───────────────────┘    └──────────────────┘
```

### Route Protection

- **Proxy (Next.js 16):** `src/proxy.js` wraps Auth.js middleware — protects `/analysis` and `/dashboard`. Redirects unauthenticated users to `/login`.
- **Server-side session:** Root layout passes the session from server to client — no API round-trip needed on page load.
- **Defence-in-depth:** Both proxy and client-side guards protect auth-required pages.

### Security

- **No passwords stored** — Authentication is delegated entirely to Google OAuth (handles 2FA, brute-force protection).
- **Input validation** — All POST data is validated with Zod schemas before processing.
- **Rate-limited APIs** — 30 req/min for write endpoints, 60 req/min for data proxies.
- **Security headers** — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy set via Next.js config.
- **`trustHost` enabled** — Prevents Auth.js session cookie domain mismatch.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Cloud project with OAuth credentials (for Google sign-in)
- A Vercel Postgres database

### 1. Clone the Repository

```bash
git clone https://github.com/ik4lyfe/fundcheck.git
cd fundcheck
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file:

```env
AUTH_SECRET=your_nextauth_secret
AUTH_GOOGLE_ID=your_google_oauth_client_id
AUTH_GOOGLE_SECRET=your_google_oauth_client_secret
POSTGRES_URL=your_vercel_postgres_connection_string
```

### 3. Set Up the Database

```bash
npx drizzle-kit push
```

This creates the `users` and `analyses` tables automatically.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Deploy to Vercel

Push to GitHub — auto-deploy is configured. Or deploy via CLI:

```bash
npm run build
vercel --prod
```

Ensure all environment variables are set in your Vercel project settings.

---

## API Reference

### `GET /api/stocks/search?q={query}`
Search Bursa Malaysia stocks by name or ticker. Returns up to 20 matching stocks with Shariah compliance status.

### `GET /api/financials?symbol={symbol}`
Fetch key financial metrics for a stock from TradingView. Returns revenue, EPS, P/E ratio, debt, free cash flow, net margin, ROE, ROA, and more.

### `GET /api/entries`
List all analyses for the current authenticated user.

### `POST /api/entries`
Save a new analysis entry (validated with Zod).

---

## Project Structure

```
src/
├── app/
│   ├── page.js              # Landing page with candlestick animation
│   ├── layout.js            # Global layout (async, passes server session)
│   ├── login/page.js        # Google sign-in page
│   ├── analysis/page.js     # Main analysis (qualitative + quantitative tabs)
│   ├── dashboard/page.js    # Saved analyses dashboard
│   └── api/
│       ├── auth/            # Auth.js route handler
│       ├── entries/         # Analysis CRUD (Postgres + Drizzle)
│       ├── financials/      # TradingView financial data proxy
│       └── stocks/search/   # Bursa stock search proxy
├── components/
│   ├── AnimatedBackground.js  # Real candlestick chart hero animation
│   ├── AutoFillButton.js      # Market data auto-filler with source badge
│   ├── ExportPdfButton.js     # Multi-page PDF report generator
│   ├── NavBar.js              # Nav with avatar menu, dark mode, hamburger
│   ├── QualitativeForm.js     # Business & management scoring (1-5)
│   ├── QuantitativeForm.js    # 7-step financial health check
│   ├── SessionProvider.js     # Auth.js client session wrapper
│   └── StockSelector.js       # Searchable stock picker + Shariah badge
├── lib/
│   ├── auth.js              # Auth.js config (Google, trustHost)
│   ├── db.js                # Neon database client
│   ├── rate-limit.js        # In-memory rate limiter
│   └── schema.js            # Drizzle ORM table definitions
├── data/
│   └── bursa-stocks.json    # Fallback stock list (if TV API unavailable)
└── proxy.js                 # Next.js 16 proxy (route protection)
```

---

## License

This project is built for personal and educational use.  
Inspired by the WealthFort International Sdn. Bhd. fundamental analysis checklists.

---

Built by [Zahiruddin Zaki](https://linkedin.com/in/zahiruddin-zaki) · Independent tool — not affiliated with WealthFort.
