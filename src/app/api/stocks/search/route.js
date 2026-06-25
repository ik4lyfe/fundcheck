import stocks from '@/data/bursa-stocks.json';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (q.length < 1) {
    return Response.json({ stocks: [] });
  }

  const query = q.toLowerCase().trim();

  const results = stocks.filter((s) => {
    const symbol = s.symbol.toLowerCase();
    const name = s.name.toLowerCase();
    return symbol.startsWith(query) || symbol.includes(query) || name.includes(query);
  }).slice(0, 20);

  return Response.json({ stocks: results });
}
