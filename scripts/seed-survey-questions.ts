import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { surveyAxes, surveyQuestions } from '../src/lib/server/db/schema';
import {
	assertDatabaseWriteAllowed,
	describeDatabase,
	requireDatabaseUrl
} from './db-safety';

const axes = [
	{
		id: 'y',
		label: 'Architecture',
		positivePole: 'Interdependent',
		negativePole: 'Autonomous',
		displayOrder: 1
	},
	{
		id: 'x',
		label: 'Drive',
		positivePole: 'Erotic',
		negativePole: 'Emotional',
		displayOrder: 2
	},
	{
		id: 'z',
		label: 'Method',
		positivePole: 'Directed',
		negativePole: 'Organic',
		displayOrder: 3
	}
] as const;

const questions: (typeof surveyQuestions.$inferInsert)[] = [
	{
		id: 'qv-y',
		bank: 'quick_vibe',
		axisId: 'y',
		position: 1,
		text: 'I envision my ideal life having a central "home base" partner or anchor, rather than keeping my living and financial life entirely my own.',
		active: true
	},
	{
		id: 'qv-x',
		bank: 'quick_vibe',
		axisId: 'x',
		position: 1,
		text: 'I want the freedom to pursue sexual variety and erotic energy with others, rather than keeping all sexual energy contained exclusively within one core bond.',
		active: true
	},
	{
		id: 'qv-z',
		bank: 'quick_vibe',
		axisId: 'z',
		position: 1,
		text: 'I prefer my relationships to operate with explicitly negotiated rules and boundaries (even if the rule is strict exclusivity), rather than fluid, unspoken social vibes.',
		active: true
	},
	{
		id: 'dd-y1',
		bank: 'deep_dive',
		axisId: 'y',
		position: 1,
		text: 'I envision my ideal life having a central "home base" partner or anchor, rather than keeping my living and financial life entirely my own.',
		active: true
	},
	{
		id: 'dd-y2',
		bank: 'deep_dive',
		axisId: 'y',
		position: 2,
		text: 'I believe it is natural and ethical for one relationship to hold clear priority in my life decisions over others.',
		active: true
	},
	{
		id: 'dd-y3',
		bank: 'deep_dive',
		axisId: 'y',
		position: 3,
		text: 'I imagine wanting to deeply merge my logistics (finances, housing, family building) with a partner, rather than maintaining strict logistical independence.',
		active: true
	},
	{
		id: 'dd-y4',
		bank: 'deep_dive',
		axisId: 'y',
		position: 4,
		text: 'I envision my ideal relationship architecture having a central, prioritized partnership, with other connections playing more peripheral roles.',
		active: true
	},
	{
		id: 'dd-y5',
		bank: 'deep_dive',
		axisId: 'y',
		position: 5,
		text: 'I see the "couple" as the fundamental unit of my relational life, rather than the "individual."',
		active: true
	},
	{
		id: 'dd-x1',
		bank: 'deep_dive',
		axisId: 'x',
		position: 1,
		text: 'I want the freedom to pursue sexual variety and erotic energy with others, rather than keeping all sexual energy contained exclusively within one core bond.',
		active: true
	},
	{
		id: 'dd-x2',
		bank: 'deep_dive',
		axisId: 'x',
		position: 2,
		text: 'I view sexual play with others primarily as a recreational enhancement to life, rather than a path to building deeply intertwined emotional lives.',
		active: true
	},
	{
		id: 'dd-x3',
		bank: 'deep_dive',
		axisId: 'x',
		position: 3,
		text: 'I am drawn to the idea of group or "moresome" energy primarily for the physical/erotic thrill, rather than for the emotional intimacy of a chosen family.',
		active: true
	},
	{
		id: 'dd-x4',
		bank: 'deep_dive',
		axisId: 'x',
		position: 4,
		text: 'I believe relationships are best when they serve the purpose of mutual pleasure and play, rather than needing to serve the practical realities of life (co-parenting, shared resources).',
		active: true
	},
	{
		id: 'dd-x5',
		bank: 'deep_dive',
		axisId: 'x',
		position: 5,
		text: 'I imagine I would be more fulfilled by a wide variety of casual/playful sexual connections than by a few deeply emotionally integrated ones.',
		active: true
	},
	{
		id: 'dd-z1',
		bank: 'deep_dive',
		axisId: 'z',
		position: 1,
		text: 'I prefer to find and manage connections through directed design (apps, explicit boundaries, scheduled quests), rather than letting them erupt organically from permissive social circles.',
		active: true
	},
	{
		id: 'dd-z2',
		bank: 'deep_dive',
		axisId: 'z',
		position: 2,
		text: 'I prefer to rely on explicitly negotiated rules and boundaries regarding outside interactions (even if the rule is strict exclusivity), rather than fluid, unspoken social vibes.',
		active: true
	},
	{
		id: 'dd-z3',
		bank: 'deep_dive',
		axisId: 'z',
		position: 3,
		text: 'I believe relational structures work best as a scheduled, defined activity, rather than something that spontaneously happens when the vibe is right.',
		active: true
	},
	{
		id: 'dd-z4',
		bank: 'deep_dive',
		axisId: 'z',
		position: 4,
		text: 'I prefer relationships to stay true to their original intent (e.g., a play partner stays a play partner; a monogamous bond stays monogamous), rather than letting them organically evolve far beyond their starting point.',
		active: true
	},
	{
		id: 'dd-z5',
		bank: 'deep_dive',
		axisId: 'z',
		position: 5,
		text: 'I am someone who designs my relationship structure from a blueprint, rather than letting it grow like a garden based on who we meet and what the situation requires.',
		active: true
	}
];

function excluded(column: string) {
	return sql.raw(`excluded.${column}`);
}

async function seed() {
	const url = requireDatabaseUrl();
	assertDatabaseWriteAllowed(url);

	const pool = new Pool({ connectionString: url.toString() });
	const db = drizzle(pool);

	try {
		await db
			.insert(surveyAxes)
			.values([...axes])
			.onConflictDoUpdate({
				target: surveyAxes.id,
				set: {
					label: excluded('label'),
					positivePole: excluded('positive_pole'),
					negativePole: excluded('negative_pole'),
					displayOrder: excluded('display_order')
				}
			});

		await db
			.insert(surveyQuestions)
			.values(questions)
			.onConflictDoUpdate({
				target: surveyQuestions.id,
				set: {
					bank: excluded('bank'),
					axisId: excluded('axis_id'),
					text: excluded('text'),
					position: excluded('position'),
					active: excluded('active')
				}
			});

		const rows = await db.select().from(surveyQuestions);
		const active = rows.filter((r) => r.active);
		const byBankAxis = (bank: string, axis: string) =>
			active.filter((r) => r.bank === bank && r.axisId === axis).length;

		const summary = {
			totalActive: active.length,
			quickVibe: {
				y: byBankAxis('quick_vibe', 'y'),
				x: byBankAxis('quick_vibe', 'x'),
				z: byBankAxis('quick_vibe', 'z')
			},
			deepDive: {
				y: byBankAxis('deep_dive', 'y'),
				x: byBankAxis('deep_dive', 'x'),
				z: byBankAxis('deep_dive', 'z')
			}
		};

		if (summary.totalActive !== 18) {
			throw new Error(`Expected 18 active questions, found ${summary.totalActive}`);
		}
		for (const axis of ['y', 'x', 'z'] as const) {
			if (summary.quickVibe[axis] !== 1) {
				throw new Error(`quick_vibe/${axis}: expected 1, got ${summary.quickVibe[axis]}`);
			}
			if (summary.deepDive[axis] !== 5) {
				throw new Error(`deep_dive/${axis}: expected 5, got ${summary.deepDive[axis]}`);
			}
		}

		console.log(`Seeded survey catalog in ${describeDatabase(url)}:`, summary);
	} finally {
		await pool.end();
	}
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
