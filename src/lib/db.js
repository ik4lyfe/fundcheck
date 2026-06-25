import { neon } from '@neondatabase/serverless';

/**
 * SQL helper for raw queries using Neon's HTTP-driven serverless client.
 * Reads connection string from process.env.DATABASE_URL (Vercel Postgres / Neon).
 *
 * Usage:
 *   import { sql } from '@/lib/db';
 *   const rows = await sql`SELECT * FROM users WHERE email = ${email}`;
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    '[db] DATABASE_URL is not set. Queries will fail until it is configured.'
  );
}

const sql = neon(connectionString || '');

/**
 * Initialize the database by creating tables if they don't exist.
 * Uses raw SQL CREATE TABLE IF NOT EXISTS for idempotent setup.
 * Call this during app startup.
 */
export async function initDatabase() {
  if (!connectionString) {
    throw new Error('Cannot initialize database: DATABASE_URL is not set');
  }

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      image TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tab TEXT NOT NULL,
      counter TEXT NOT NULL,
      date_of_review TEXT NOT NULL,
      data JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  console.log('[db] Database tables initialized');
}

export { sql };
