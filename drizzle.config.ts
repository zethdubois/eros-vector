import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_PUBLIC_URL?.trim() || process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
	throw new Error(
		'DATABASE_URL is required for drizzle-kit (optional DATABASE_PUBLIC_URL for local access)'
	);
}

export default defineConfig({
	out: './drizzle',
	schema: './src/lib/server/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: databaseUrl
	},
	tablesFilter: [
		'survey_axes',
		'survey_questions',
		'visitors',
		'visitor_sessions',
		'survey_responses'
	]
});
