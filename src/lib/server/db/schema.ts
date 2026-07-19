import { sql } from 'drizzle-orm';
import {
	boolean,
	check,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';

export const surveyBankEnum = pgEnum('survey_bank', ['quick_vibe', 'deep_dive']);

export const surveyResponseStatusEnum = pgEnum('survey_response_status', [
	'in_progress',
	'complete',
	'abandoned'
]);

/** Canonical axis catalog — Y / X / Z poles for scoring and copy. */
export const surveyAxes = pgTable('survey_axes', {
	id: text('id').primaryKey(),
	label: text('label').notNull(),
	positivePole: text('positive_pole').notNull(),
	negativePole: text('negative_pole').notNull(),
	/** Canonical bank order: lower first (Y → X → Z) for deterministic shuffles. */
	displayOrder: integer('display_order').notNull().unique()
});

/** Scored Likert items, keyed by stable IDs used in client answer maps. */
export const surveyQuestions = pgTable(
	'survey_questions',
	{
		id: text('id').primaryKey(),
		bank: surveyBankEnum('bank').notNull(),
		axisId: text('axis_id')
			.notNull()
			.references(() => surveyAxes.id, { onDelete: 'restrict' }),
		text: text('text').notNull(),
		/** 1-based position within bank + axis. */
		position: integer('position').notNull(),
		active: boolean('active').notNull().default(true)
	},
	(table) => [
		uniqueIndex('survey_questions_bank_axis_position_uidx').on(
			table.bank,
			table.axisId,
			table.position
		),
		check('survey_questions_position_positive', sql`${table.position} >= 1`)
	]
);

/** Anonymous browser identity — no accounts; id matches signed `ev_visitor` cookie. */
export const visitors = pgTable('visitors', {
	id: uuid('id').defaultRandom().primaryKey(),
	firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull().defaultNow(),
	lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
	firstRegion: text('first_region'),
	lastRegion: text('last_region'),
	/** HMAC of client IP with IP_HASH_SECRET — raw IP is never stored. */
	ipHash: text('ip_hash'),
	userAgentSummary: text('user_agent_summary')
});

/** Visit-level activity window for a visitor. */
export const visitorSessions = pgTable('visitor_sessions', {
	id: uuid('id').defaultRandom().primaryKey(),
	visitorId: uuid('visitor_id')
		.notNull()
		.references(() => visitors.id, { onDelete: 'cascade' }),
	startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
	lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).notNull().defaultNow(),
	region: text('region'),
	landingPath: text('landing_path'),
	referrer: text('referrer')
});

/** One survey attempt; full client state stored as jsonb for flexible analytics. */
export const surveyResponses = pgTable('survey_responses', {
	id: uuid('id').defaultRandom().primaryKey(),
	visitorId: uuid('visitor_id')
		.notNull()
		.references(() => visitors.id, { onDelete: 'cascade' }),
	sessionId: uuid('session_id').references(() => visitorSessions.id, { onDelete: 'set null' }),
	status: surveyResponseStatusEnum('status').notNull().default('in_progress'),
	phase: text('phase').notNull(),
	state: jsonb('state').notNull(),
	results: jsonb('results'),
	/** Access role of the respondent at the time of the survey (beta / reviewer / developer). */
	role: text('role'),
	startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	completedAt: timestamp('completed_at', { withTimezone: true })
});

export type SurveyAxisRow = typeof surveyAxes.$inferSelect;
export type SurveyQuestionRow = typeof surveyQuestions.$inferSelect;
export type VisitorRow = typeof visitors.$inferSelect;
export type VisitorSessionRow = typeof visitorSessions.$inferSelect;
export type SurveyResponseRow = typeof surveyResponses.$inferSelect;
