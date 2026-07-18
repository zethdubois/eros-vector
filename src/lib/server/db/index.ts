import { env } from '$env/dynamic/private';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

type Db = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as typeof globalThis & {
	__erosVectorPgPool?: Pool;
	__erosVectorDb?: Db;
};

/**
 * Prefer DATABASE_PUBLIC_URL for laptop/CLI access to Railway Postgres.
 * Inside Railway, DATABASE_URL (private hostname) is enough.
 *
 * Uses SvelteKit `$env/dynamic/private` so `.env` values are visible under Vite SSR
 * (plain `process.env.DATABASE_URL` is often empty in `pnpm dev`).
 */
export function resolveDatabaseUrl(): string {
	const publicUrl = env.DATABASE_PUBLIC_URL?.trim() || process.env.DATABASE_PUBLIC_URL?.trim();
	const url = publicUrl || env.DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();
	if (!url) {
		throw new Error('DATABASE_URL is not set (optional DATABASE_PUBLIC_URL for local access)');
	}
	return url;
}

function getPool(): Pool {
	if (!globalForDb.__erosVectorPgPool) {
		globalForDb.__erosVectorPgPool = new Pool({
			connectionString: resolveDatabaseUrl()
		});
	}
	return globalForDb.__erosVectorPgPool;
}

/** Lazy pooled Drizzle client (safe to import without DATABASE_URL until first use). */
export function getDb(): Db {
	if (!globalForDb.__erosVectorDb) {
		globalForDb.__erosVectorDb = drizzle(getPool(), { schema });
	}
	return globalForDb.__erosVectorDb;
}
