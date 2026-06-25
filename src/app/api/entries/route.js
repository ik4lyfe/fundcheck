import { getDb } from '@/lib/schema'
import { analyses } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'

const limiter = rateLimit({ interval: 60 * 1000, max: 30 })

const VALID_TABS = Object.freeze(['business', 'management', 'quantitative'])

const postSchema = z.object({
  tab: z.enum(VALID_TABS),
  data: z.record(z.unknown()),
})

export async function GET(request) {
  const { allowed, retryAfter } = limiter.check(request)
  if (!allowed) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

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
  const { allowed, retryAfter } = limiter.check(request)
  if (!allowed) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const { tab, data } = parsed.data
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
