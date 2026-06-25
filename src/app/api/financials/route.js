// API route: /api/financials?symbol=INARI
import { rateLimit } from '@/lib/rate-limit'

const limiter = rateLimit({ interval: 60 * 1000, max: 30 })

// Fetches financial data from TradingView for Bursa Malaysia stocks.
// Built for sustainability — errors never propagate to the client.
// If TradingView API changes, the worst case is empty returns, not crashes.

const TRADINGVIEW_COLUMNS = [
  'close', 'volume', 'market_cap_basic',
  'total_revenue', 'revenue_per_share_ttm',
  'earnings_per_share_basic_ttm',
  'dividend_yield_recent',
  'free_cash_flow',
  'current_ratio',
  'total_assets', 'total_current_assets', 'total_current_liabilities',
  'total_debt',
  'price_earnings_ttm', 'price_to_book',
  'return_on_equity', 'return_on_assets',
  'net_margin', 'gross_margin', 'operating_margin',
  'ebitda', 'ebitda_margin',
  'number_of_employees',
];

const COLUMN_MAP = {
  close: 'price',
  volume: 'volume',
  market_cap_basic: 'marketCap',
  total_revenue: 'revenue',
  revenue_per_share_ttm: 'revenuePerShare',
  earnings_per_share_basic_ttm: 'eps',
  dividend_yield_recent: 'dividendYield',
  free_cash_flow: 'freeCashFlow',
  current_ratio: 'currentRatio',
  total_assets: 'totalAssets',
  total_current_assets: 'currentAssets',
  total_current_liabilities: 'currentLiabilities',
  total_debt: 'totalDebt',
  price_earnings_ttm: 'pe',
  price_to_book: 'pb',
  return_on_equity: 'roe',
  return_on_assets: 'roa',
  net_margin: 'netMargin',
  gross_margin: 'grossMargin',
  operating_margin: 'operatingMargin',
  ebitda: 'ebitda',
  ebitda_margin: 'ebitdaMargin',
  number_of_employees: 'employees',
};

export async function GET(request) {
  const { allowed, retryAfter } = limiter.check(request)
  if (!allowed) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get('symbol') || '').trim().toUpperCase();

  if (!symbol) {
    return Response.json({ success: false, error: 'Symbol required' });
  }

  try {
    const tvSymbol = `MYX:${symbol}`;
    const body = JSON.stringify({
      symbols: { tickers: [tvSymbol] },
      columns: TRADINGVIEW_COLUMNS,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch('https://scanner.tradingview.com/malaysia/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`[financials] TradingView HTTP ${res.status} for ${symbol}`);
      return Response.json({ success: false, error: 'Data source unavailable' });
    }

    const json = await res.json();

    if (!json.data || json.data.length === 0) {
      return Response.json({ success: false, error: 'Stock not found' });
    }

    const raw = json.data[0];
    const values = raw.d || [];
    const result = {};
    TRADINGVIEW_COLUMNS.forEach((col, i) => {
      const newKey = COLUMN_MAP[col];
      if (!newKey) return;
      const val = values[i];
      if (val !== null && val !== undefined) {
        result[newKey] = val;
      }
    });

    // Compute derived values
    // Current Liabilities from Current Ratio = Current Assets / Current Ratio
    if (result.currentRatio && result.currentRatio > 0 && !result.currentLiabilities) {
      if (result.currentAssets) {
        result.currentLiabilities = Math.round(result.currentAssets / result.currentRatio * 100) / 100;
      }
    }

    // Round decimal values for readability
    if (result.price) result.price = Math.round(result.price * 100) / 100;
    if (result.dividendYield) result.dividendYield = Math.round(result.dividendYield * 100) / 100;
    if (result.currentRatio) result.currentRatio = Math.round(result.currentRatio * 100) / 100;
    if (result.pe) result.pe = Math.round(result.pe * 100) / 100;
    if (result.netMargin) result.netMargin = Math.round(result.netMargin * 100) / 100;
    if (result.grossMargin) result.grossMargin = Math.round(result.grossMargin * 100) / 100;
    if (result.operatingMargin) result.operatingMargin = Math.round(result.operatingMargin * 100) / 100;
    if (result.roe) result.roe = Math.round(result.roe * 100) / 100;
    if (result.roa) result.roa = Math.round(result.roa * 100) / 100;

    return Response.json({
      success: true,
      symbol,
      source: {
        name: 'TradingView',
        url: `https://www.tradingview.com/symbols/MYX-${symbol}/`,
        fetchedAt: new Date().toISOString(),
      },
      data: result,
    });
  } catch (err) {
    const msg = err?.message || 'Unknown error';
    const name = err?.name || '';
    console.error(`[financials] Error fetching ${symbol}: ${name}: ${msg}`);
    return Response.json({ success: false, error: 'Failed to fetch financial data' });
  }
}
