import type { Answers, Axis, Coordinates, LikertValue, Question } from './types';

/** Transform Likert 1–5 → coordinate −2…+2 */
export function likertToCoord(value: LikertValue): number {
	return value - 3;
}

/**
 * Average transformed scores per axis for a response set.
 * Missing answers are skipped; an axis with no answers scores 0.
 */
export function scoreAnswers(answers: Answers, questions: Question[]): Coordinates {
	const sums: Record<Axis, number> = { w: 0, x: 0, y: 0, z: 0 };
	const counts: Record<Axis, number> = { w: 0, x: 0, y: 0, z: 0 };

	for (const q of questions) {
		const raw = answers[q.id];
		if (raw === undefined) continue;
		sums[q.axis] += likertToCoord(raw);
		counts[q.axis] += 1;
	}

	const avg = (axis: Axis) => (counts[axis] === 0 ? 0 : sums[axis] / counts[axis]);

	return {
		w: avg('w'),
		x: avg('x'),
		y: avg('y'),
		z: avg('z')
	};
}

export function isComplete(answers: Answers, questions: Question[]): boolean {
	return questions.every((q) => answers[q.id] !== undefined);
}

export function answerCount(answers: Answers): number {
	return Object.keys(answers).length;
}
