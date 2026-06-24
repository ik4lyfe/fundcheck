import { getEntries, addEntry } from '@/lib/sheets';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get('tab') || 'business';

  const entries = await getEntries(tab);
  return Response.json({ entries });
}

export async function POST(request) {
  const { tab, data } = await request.json();
  const result = await addEntry(tab, data);
  return Response.json(result);
}
