import { asc, eq } from 'drizzle-orm';
import { fallbackQuestionBanks } from '$lib/questionCatalog';
import type { Axis, Question } from '$lib/types';
import { getDb } from './index';
import { surveyAxes, surveyQuestions } from './schema';

export type QuestionBanks = {
	quickVibe: Question[];
	deepDive: Question[];
};

/** Minimum active question counts required per bank for the core XYZ axes. W is additive and not yet enforced. */
const EXPECTED = {
	quickVibe: { y: 1, x: 1, z: 1 },
	deepDive: { y: 5, x: 5, z: 5 }
} as const;

type CoreAxis = 'x' | 'y' | 'z';

function assertAxis(id: string): Axis {
	if (id === 'x' || id === 'y' || id === 'z' || id === 'w') return id;
	throw new Error(`Invalid survey axis id in database: ${id}`);
}

function countByAxis(questions: Question[]): Record<Axis, number> {
	const counts: Record<Axis, number> = { x: 0, y: 0, z: 0, w: 0 };
	for (const q of questions) {
		counts[q.axis] += 1;
	}
	return counts;
}

function assertBankCounts(
	bank: 'quickVibe' | 'deepDive',
	questions: Question[],
	expected: Record<CoreAxis, number>
): void {
	const counts = countByAxis(questions);
	for (const axis of ['y', 'x', 'z'] as const) {
		if (counts[axis] !== expected[axis]) {
			throw new Error(
				`Survey catalog incomplete: ${bank} expected ${expected[axis]} question(s) on axis ${axis}, found ${counts[axis]}`
			);
		}
	}
}

async function loadFromDatabase(): Promise<QuestionBanks> {
	const db = getDb();
	const rows = await db
		.select({
			id: surveyQuestions.id,
			axisId: surveyQuestions.axisId,
			text: surveyQuestions.text,
			bank: surveyQuestions.bank
		})
		.from(surveyQuestions)
		.innerJoin(surveyAxes, eq(surveyQuestions.axisId, surveyAxes.id))
		.where(eq(surveyQuestions.active, true))
		.orderBy(asc(surveyAxes.displayOrder), asc(surveyQuestions.position));

	const quickVibe: Question[] = [];
	const deepDive: Question[] = [];

	for (const row of rows) {
		const question: Question = {
			id: row.id,
			axis: assertAxis(row.axisId),
			text: row.text
		};
		if (row.bank === 'quick_vibe') quickVibe.push(question);
		else deepDive.push(question);
	}

	assertBankCounts('quickVibe', quickVibe, EXPECTED.quickVibe);
	assertBankCounts('deepDive', deepDive, EXPECTED.deepDive);

	return { quickVibe, deepDive };
}

/**
 * Load active scored questions in canonical Y → X → Z order.
 * Falls back to the in-repo catalog when Postgres is unreachable (e.g. local
 * `.env` still pointing at `*.railway.internal`).
 */
export async function loadQuestionBanks(): Promise<QuestionBanks> {
	try {
		return await loadFromDatabase();
	} catch (err) {
		console.warn(
			'Survey catalog DB unavailable — using in-repo fallback. For local Railway access set DATABASE_PUBLIC_URL to the public proxy URL.',
			err
		);
		return fallbackQuestionBanks();
	}
}
