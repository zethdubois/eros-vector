import { loadQuestionBanks } from '$lib/server/db/catalog';
import type { PageServerLoad } from './$types';

const AXIS_LABELS = {
	y: 'Y — Structure ↔ Autonomy',
	x: 'X — Eroticism ↔ Emotional Depth',
	z: 'Z — Intentional ↔ Organic'
} as const;

export const load: PageServerLoad = async () => {
	const banks = await loadQuestionBanks();

	function groupByAxis(questions: typeof banks.deepDive) {
		return (['y', 'x', 'z'] as const).map((axis) => ({
			axis,
			label: AXIS_LABELS[axis],
			questions: questions.filter((q) => q.axis === axis)
		}));
	}

	return {
		quickVibe: groupByAxis(banks.quickVibe),
		deepDive: groupByAxis(banks.deepDive),
		counts: {
			quickVibe: banks.quickVibe.length,
			deepDive: banks.deepDive.length
		}
	};
};
