import { getDb } from '@/lib/schema'
import { analyses } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET(request) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const tab = searchParams.get('tab') || 'business'
  const isAdmin = session.user.role === 'admin'

  const db = getDb()
  let rows
  if (isAdmin) {
    rows = await db.select().from(analyses).where(eq(analyses.tab, tab)).orderBy(desc(analyses.createdAt)).limit(50)
  } else {
    rows = await db.select().from(analyses)
      .where(eq(analyses.tab, tab) && eq(analyses.userId, session.user.id))
      .orderBy(desc(analyses.createdAt)).limit(50)
  }

  return Response.json({ entries: rows })
}

export async function POST(request) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { tab, data } = await request.json()
  const db = getDb()

  await db.insert(analyses).values({
    userId: session.user.id,
    tab,
    counter: data.Counter || data.counter || '',
    dateOfReview: data['Date of Review'] || data.dateOfReview || '',
    data,
  })

  return Response.json({ success: true })
}
