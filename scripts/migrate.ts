import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import {
	assertDatabaseWriteAllowed,
	describeDatabase,
	requireDatabaseUrl
} from './db-safety';

const url = requireDatabaseUrl();
assertDatabaseWriteAllowed(url);

const pool = new Pool({ connectionString: url.toString() });

try {
	await migrate(drizzle(pool), { migrationsFolder: './drizzle' });
	console.log(`Migrations applied to ${describeDatabase(url)}.`);
} finally {
	await pool.end();
}
