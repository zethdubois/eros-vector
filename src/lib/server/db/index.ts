import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

type Db = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as typeof globalThis & {
	__erosVectorPgPool?: Pool;
	__erosVectorDb?: Db;
};

function requireDatabaseUrl(): string {
	const url = process.env.DATABASE_URL;
	if (!url) {
		throw new Error('DATABASE_URL is not set');
	}
	return url;
}

function getPool(): Pool {
	if (!globalForDb.__erosVectorPgPool) {
		globalForDb.__erosVectorPgPool = new Pool({
			connectionString: requireDatabaseUrl()
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
