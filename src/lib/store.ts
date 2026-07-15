import { get, writable } from 'svelte/store';
import { computeRouting } from './routing';
import { newQuestionSeed } from './shuffle';
import type { Answers, DualModeAnswers, Era, LikertValue, Phase, SurveyState } from './types';

export const STORAGE_KEY = 'eros-vector-survey';

const PHASES: Phase[] = ['intake', 't0', 't1', 't2', 't3', 'results'];

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
		phase: 'intake'
	};
}

function newEraId(): string {
	return crypto.randomUUID();
}

function isPhase(value: unknown): value is Phase {
	return typeof value === 'string' && (PHASES as string[]).includes(value);
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
			horizon: data.horizon === undefined ? base.horizon : data.horizon,
			phase: data.phase
		};
	} catch {
		return null;
	}
}

function readStorage(): SurveyState | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return parseStoredState(raw);
	} catch {
		return null;
	}
}

function writeStorage(state: SurveyState) {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// ignore quota / privacy errors
	}
}

function clearStorage() {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// ignore
	}
}

/** In-memory store; always sync to localStorage inside mutate(). */
export const survey = writable<SurveyState>(createInitialState());

function mutate(fn: (s: SurveyState) => SurveyState) {
	survey.update((s) => {
		const next = fn(s);
		writeStorage(next);
		return next;
	});
}

/** Load saved progress into the store. Returns the phase that was restored. */
export function hydrateSurvey(): Phase {
	const stored = readStorage();
	if (stored) {
		survey.set(stored);
		writeStorage(stored); // persist backfilled questionSeed if missing from older saves
		return stored.phase;
	}
	const initial = createInitialState();
	survey.set(initial);
	writeStorage(initial);
	return initial.phase;
}

export function resetSurvey() {
	clearStorage();
	const initial = createInitialState();
	survey.set(initial);
	writeStorage(initial);
}

export function submitIntake(chronAge: number, awakeAge: number) {
	const { intake, routing } = computeRouting(chronAge, awakeAge);
	mutate((s) => ({
		...s,
		intake,
		routing,
		eras: routing.t0
			? [
					{
						id: newEraId(),
						name: '',
						scouting: {},
						bound: {},
						shadow: false
					}
				]
			: [],
		horizon: routing.finalForm ? null : {},
		phase: routing.t0 ? 't0' : 't1'
	}));
}

export function setPhase(phase: Phase) {
	mutate((s) => ({ ...s, phase }));
}

export function advanceFrom(phase: Phase) {
	mutate((s) => {
		const r = s.routing;
		if (!r) return s;

		let next: Phase = 'results';
		if (phase === 't0') next = 't1';
		else if (phase === 't1') next = 't2';
		else if (phase === 't2') next = r.finalForm ? 'results' : 't3';
		else if (phase === 't3') next = 'results';

		return { ...s, phase: next };
	});
}

export function addEra() {
	mutate((s) => {
		if (s.eras.length >= 4) return s;
		return {
			...s,
			eras: [
				...s.eras,
				{ id: newEraId(), name: '', scouting: {}, bound: {}, shadow: false }
			]
		};
	});
}

export function removeEra(id: string) {
	mutate((s) => {
		if (s.eras.length <= 1) return s;
		return { ...s, eras: s.eras.filter((e) => e.id !== id) };
	});
}

export function updateEraName(id: string, name: string) {
	mutate((s) => ({
		...s,
		eras: s.eras.map((e) => (e.id === id ? { ...e, name } : e))
	}));
}

export function setEraAnswer(
	eraId: string,
	mode: 'scouting' | 'bound',
	questionId: string,
	value: LikertValue
) {
	mutate((s) => ({
		...s,
		eras: s.eras.map((e) => {
			if (e.id !== eraId) return e;
			return {
				...e,
				[mode]: { ...e[mode], [questionId]: value }
			};
		})
	}));
}

export function setEraShadow(eraId: string, shadow: boolean) {
	mutate((s) => ({
		...s,
		eras: s.eras.map((e) => (e.id === eraId ? { ...e, shadow } : e))
	}));
}

export function setPresentAnswer(
	mode: 'scouting' | 'bound',
	questionId: string,
	value: LikertValue
) {
	mutate((s) => ({
		...s,
		present: {
			...s.present,
			[mode]: { ...s.present[mode], [questionId]: value }
		}
	}));
}

export function setPresentShadow(shadow: boolean) {
	mutate((s) => ({
		...s,
		present: { ...s.present, shadow }
	}));
}

export function setAspirationAnswer(questionId: string, value: LikertValue) {
	mutate((s) => ({
		...s,
		aspiration: { ...s.aspiration, [questionId]: value }
	}));
}

export function setHorizonAnswer(questionId: string, value: LikertValue) {
	mutate((s) => ({
		...s,
		horizon: { ...(s.horizon ?? {}), [questionId]: value }
	}));
}

/** Debug helper */
export function peekSurveyStorage(): string | null {
	if (typeof localStorage === 'undefined') return null;
	return localStorage.getItem(STORAGE_KEY);
}

export function peekSurveyPhase(): Phase {
	return get(survey).phase;
}

export type { Answers, DualModeAnswers, Era, SurveyState };
