/**
 * Simple in-memory rate limiter for Vercel serverless functions.
 * Uses a sliding window approach. Stores state per IP.
 *
 * Note: In-memory means each cold start resets counters.
 * For production with multiple instances, use Redis/Upstash instead.
 */

const hits = new Map()

export function rateLimit({ interval = 60 * 1000, max = 30 } = {}) {
  return {
    check(request) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
               || request.headers.get('x-real-ip')
               || 'anonymous'
      const now = Date.now()
      const entry = hits.get(ip)

      if (!entry || (now - entry.start) > interval) {
        hits.set(ip, { start: now, count: 1 })
        return { allowed: true, remaining: max - 1 }
      }

      entry.count += 1
      if (entry.count > max) {
        return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.start + interval - now) / 1000) }
      }

      return { allowed: true, remaining: max - entry.count }
    },
  }
}
