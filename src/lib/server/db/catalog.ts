import { asc, eq } from 'drizzle-orm';
import type { Axis, Question } from '$lib/types';
import { getDb } from './index';
import { surveyAxes, surveyQuestions } from './schema';

export type QuestionBanks = {
	quickVibe: Question[];
	deepDive: Question[];
};

const EXPECTED = {
	quickVibe: { y: 1, x: 1, z: 1 },
	deepDive: { y: 5, x: 5, z: 5 }
} as const;

function assertAxis(id: string): Axis {
	if (id === 'x' || id === 'y' || id === 'z') return id;
	throw new Error(`Invalid survey axis id in database: ${id}`);
}

function countByAxis(questions: Question[]): Record<Axis, number> {
	const counts: Record<Axis, number> = { x: 0, y: 0, z: 0 };
	for (const q of questions) {
		counts[q.axis] += 1;
	}
	return counts;
}

function assertBankCounts(
	bank: 'quickVibe' | 'deepDive',
	questions: Question[],
	expected: Record<Axis, number>
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

/** Load active scored questions in canonical Y → X → Z, position order. */
export async function loadQuestionBanks(): Promise<QuestionBanks> {
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
