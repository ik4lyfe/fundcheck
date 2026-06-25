import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import {
  pgTable,
  text,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';

/**
 * Helper: SQL expression for gen_random_uuid() used as default on primary keys.
 */
const uuidDefault = sql`gen_random_uuid()`;

/**
 * Users table
 * - id: UUID text, auto-generated via Postgres gen_random_uuid()
 * - name: display name
 * - email: unique login identifier
 * - image: optional avatar URL
 * - role: 'user' or 'admin'
 * - createdAt: auto-set timestamp
 */
export const users = pgTable('users', {
  id: text('id').primaryKey().default(uuidDefault),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  image: text('image'),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Analyses table
 * - id: UUID text auto-generated via gen_random_uuid()
 * - userId: FK to users.id
 * - tab: 'business' | 'management' | 'quantitative'
 * - counter: string identifier for the analysis row
 * - dateOfReview: review date as text
 * - data: JSONB blob storing flat key-value form data
 * - createdAt / updatedAt: timestamps
 */
export const analyses = pgTable('analyses', {
  id: text('id').primaryKey().default(uuidDefault),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tab: text('tab').notNull(),
  counter: text('counter').notNull(),
  dateOfReview: text('date_of_review').notNull(),
  data: jsonb('data').notNull().default('{}'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Drizzle database instance backed by Neon's HTTP-driven sql function.
 * Lazily initialized so that module-level table exports can be imported
 * by drizzle-kit without requiring DATABASE_URL at config-load time.
 */
let _db;
let _neonSql;

export function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL environment variable is not set. ' +
        'Set it in .env.local or your deployment environment.'
      );
    }
    _neonSql = neon(process.env.DATABASE_URL);
    _db = drizzle({ client: _neonSql, schema: { users, analyses } });
  }
  return _db;
}

export function getSql() {
  if (!_neonSql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set.');
    }
    _neonSql = neon(process.env.DATABASE_URL);
  }
  return _neonSql;
}
