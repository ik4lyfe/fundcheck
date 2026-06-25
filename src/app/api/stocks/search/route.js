import stocks from '@/data/bursa-stocks.json';
import { rateLimit } from '@/lib/rate-limit'

const limiter = rateLimit({ interval: 60 * 1000, max: 60 })

// In-memory cache for TV stock list with shariah data
let tvCache = null;
let tvCacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function fetchTVStocks() {
  const now = Date.now();
  if (tvCache && (now - tvCacheTime) < CACHE_TTL) {
    return tvCache;
  }

  try {
    const res = await fetch('https://scanner.tradingview.com/malaysia/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbols: { query: { types: [] } },
        columns: ['name', 'description', 'is_shariah_compliant', 'sector', 'market_cap_basic'],
        range: [0, 1500],
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`TV API returned ${res.status}`);

    const data = await res.json();
    const list = (data.data || []).map((item) => {
      const d = item.d;
      return {
        symbol: d[0],
        name: d[1],
        shariah: d[2] === true, // true = compliant, null = non-compliant
        sector: d[3] || 'Unknown',
        market: item.s.split(':')[0] || 'MYX',
      };
    }).filter((s) => {
      // Only keep common stocks, skip ETFs / warrants / indices
      const sym = s.symbol;
      return sym.length <= 12 && sym === sym.toUpperCase() && /^[A-Z0-9&]+$/.test(sym) && !sym.includes('-');
    });

    tvCache = list;
    tvCacheTime = now;
    return list;
  } catch (err) {
    console.error('TV stock fetch failed, using fallback:', err.message);
    return null;
  }
}

export async function GET(request) {
  const { allowed, retryAfter } = limiter.check(request)
  if (!allowed) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (q.length < 1) {
    return Response.json({ stocks: [] });
  }

  const query = q.toLowerCase().trim();

  // Try TV API first
  const tvList = await fetchTVStocks();
  let results;

  if (tvList) {
    results = tvList.filter((s) => {
      const symbol = s.symbol.toLowerCase();
      const name = s.name.toLowerCase();
      return symbol.startsWith(query) || symbol.includes(query) || name.includes(query);
    }).slice(0, 20);
  } else {
    // Fallback to static list (no shariah data)
    results = stocks.filter((s) => {
      const symbol = s.symbol.toLowerCase();
      const name = s.name.toLowerCase();
      return symbol.startsWith(query) || symbol.includes(query) || name.includes(query);
    }).slice(0, 20).map((s) => ({ ...s, shariah: null }));
  }

  return Response.json({ stocks: results });
}
