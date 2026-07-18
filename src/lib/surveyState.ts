import type { Answers, DualModeAnswers, Phase, SurveyState } from './types';
import { newQuestionSeed } from './shuffle';

const PHASES: Phase[] = [
	'intake',
	't0',
	'pause-t0',
	't1',
	'pause-t1',
	't2',
	'pause-t2',
	't3',
	'pause-t3',
	'complete'
];

function emptyDual(): DualModeAnswers {
	return { scouting: {}, bound: {}, shadow: false };
}

export function createInitialState(): SurveyState {
	return {
		questionSeed: newQuestionSeed(),
		intake: null,
		routing: null,
		eras: [],
		present: emptyDual(),
		aspiration: {},
		horizon: null,
		horizonIncluded: null,
		pauseEraId: null,
		phase: 'intake'
	};
}

function isPhase(value: unknown): value is Phase {
	return typeof value === 'string' && (PHASES as string[]).includes(value);
}

function normalizeHorizon(data: Partial<SurveyState>, base: SurveyState): Answers | null {
	if (data.horizon === null || data.horizon === undefined) return null;
	if (typeof data.horizon !== 'object') return null;
	const keys = Object.keys(data.horizon);
	if (keys.length === 0 && data.horizonIncluded !== true) return null;
	return data.horizon as Answers;
}

export function parseStoredState(raw: string): SurveyState | null {
	try {
		const data = JSON.parse(raw) as Partial<SurveyState>;
		if (!data || typeof data !== 'object' || !isPhase(data.phase)) return null;

		const base = createInitialState();
		const seed =
			typeof data.questionSeed === 'number' && Number.isFinite(data.questionSeed)
				? data.questionSeed >>> 0
				: base.questionSeed;

		// Migrate legacy `results` phase
		const phase: Phase = (data.phase as string) === 'results' ? 'complete' : data.phase;

		const horizonIncluded =
			typeof data.horizonIncluded === 'boolean' ? data.horizonIncluded : base.horizonIncluded;

		return {
			...base,
			...data,
			questionSeed: seed,
			present: {
				...emptyDual(),
				...(data.present ?? {})
			},
			eras: Array.isArray(data.eras) ? data.eras : [],
			aspiration: data.aspiration ?? {},
			horizon: normalizeHorizon(data, base),
			horizonIncluded,
			pauseEraId: typeof data.pauseEraId === 'string' ? data.pauseEraId : null,
			phase
		};
	} catch {
		return null;
	}
}
