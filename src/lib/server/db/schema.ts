import { sql } from 'drizzle-orm';
import {
	boolean,
	check,
	integer,
	pgEnum,
	pgTable,
	text,
	uniqueIndex
} from 'drizzle-orm/pg-core';

export const surveyBankEnum = pgEnum('survey_bank', ['quick_vibe', 'deep_dive']);

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

export type SurveyAxisRow = typeof surveyAxes.$inferSelect;
export type SurveyQuestionRow = typeof surveyQuestions.$inferSelect;
