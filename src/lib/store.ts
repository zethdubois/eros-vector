import { get, writable } from 'svelte/store';
import { decodeSaveKeyPayload, encodeSaveKeyPayload } from './saveKey';
import { computeRouting } from './routing';
import type { SectionId } from './surveyNav';
import { createInitialState, parseStoredState } from './surveyState';
import { clearResponseId, queueSurveySync } from './surveySync';
import type { DualModeAnswers, Era, LikertValue, Phase, SurveyState } from './types';

export const STORAGE_KEY = 'eros-vector-survey';

export { createInitialState, parseStoredState };

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

function newEraId(): string {
	return crypto.randomUUID();
}

/** In-memory store; always sync to localStorage inside mutate(). */
export const survey = writable<SurveyState>(createInitialState());

function mutate(
	fn: (s: SurveyState) => SurveyState,
	syncEvent?: 'start' | 'answer' | 'phase' | 'complete'
) {
	let nextState: SurveyState | null = null;
	survey.update((s) => {
		const next = fn(s);
		writeStorage(next);
		nextState = next;
		return next;
	});
	if (syncEvent && nextState) {
		queueSurveySync(syncEvent, nextState);
	}
}

/** Load saved progress into the store. Returns the phase that was restored. */
export function hydrateSurvey(): Phase {
	const stored = readStorage();
	if (stored) {
		survey.set(stored);
		writeStorage(stored);
		if (stored.phase !== 'intake' || stored.intake !== null) {
			queueSurveySync(stored.phase === 'complete' ? 'complete' : 'phase', stored);
		}
		return stored.phase;
	}
	const initial = createInitialState();
	survey.set(initial);
	writeStorage(initial);
	return initial.phase;
}

export function resetSurvey() {
	clearStorage();
	clearResponseId();
	const initial = createInitialState();
	survey.set(initial);
	writeStorage(initial);
}

/** Encode current survey state as a portable private key. */
export function exportSurveyKey(state?: SurveyState): string {
	return encodeSaveKeyPayload(JSON.stringify(state ?? get(survey)));
}

export type ImportSurveyKeyResult =
	| { ok: true; phase: Phase }
	| { ok: false; error: string };

/** Restore survey state from a portable private key. */
export function importSurveyKey(key: string): ImportSurveyKeyResult {
	const trimmed = key.trim();
	if (!trimmed) return { ok: false, error: 'Paste a save key first.' };

	const json = decodeSaveKeyPayload(trimmed);
	if (!json) return { ok: false, error: 'Invalid save key — check that you copied the full string.' };

	const parsed = parseStoredState(json);
	if (!parsed) return { ok: false, error: 'Invalid save key — check that you copied the full string.' };

	clearResponseId();
	survey.set(parsed);
	writeStorage(parsed);
	queueSurveySync(parsed.phase === 'complete' ? 'complete' : 'start', parsed);
	return { ok: true, phase: parsed.phase };
}

export function submitIntake(chronAge: number, awakeAge: number) {
	const { intake, routing } = computeRouting(chronAge, awakeAge);
	mutate(
		(s) => ({
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
			horizon: null,
			horizonIncluded: null,
			pauseEraId: null,
			phase: routing.t0 ? 't0' : 't1'
		}),
		'start'
	);
}

export function setPhase(phase: Phase) {
	mutate((s) => ({ ...s, phase }), 'phase');
}

/** Show the billboard after completing a survey section. */
export function finishPhase(phase: 't0' | 't1' | 't2' | 't3', eraId?: string) {
	mutate((s) => {
		if (phase === 't0') {
			return { ...s, phase: 'pause-t0', pauseEraId: eraId ?? null };
		}
		if (phase === 't1') return { ...s, phase: 'pause-t1', pauseEraId: null };
		if (phase === 't2') return { ...s, phase: 'pause-t2', pauseEraId: null };
		if (phase === 't3') return { ...s, phase: 'pause-t3', pauseEraId: null };
		return s;
	}, 'phase');
}

/** Continue from a standard phase billboard into the next section. */
export function continueFromPause() {
	const current = get(survey).phase;
	const syncEvent =
		current === 'pause-t2' || current === 'pause-t3' ? 'complete' : 'phase';
	mutate((s) => {
		switch (s.phase) {
			case 'pause-t0':
				return { ...s, phase: 't0', pauseEraId: null };
			case 'pause-t1':
				return { ...s, phase: 't2', pauseEraId: null };
			case 'pause-t2':
				return { ...s, phase: 'complete', pauseEraId: null };
			case 'pause-t3':
				return { ...s, phase: 'complete', pauseEraId: null };
			default:
				return s;
		}
	}, syncEvent);
}

export function includeHorizon() {
	mutate(
		(s) => ({
			...s,
			horizonIncluded: true,
			horizon: {},
			phase: 't3'
		}),
		'phase'
	);
}

export function skipHorizon() {
	mutate(
		(s) => ({
			...s,
			horizonIncluded: false,
			horizon: null,
			phase: 'complete'
		}),
		'complete'
	);
}

/** Skip Past eras entirely and continue to Present. */
export function skipPastEras() {
	mutate(
		(s) => ({
			...s,
			eras: [],
			pauseEraId: null,
			phase: 't1'
		}),
		'phase'
	);
}

/** Jump to a survey section from breadcrumbs or results actions. */
export function navigateToSection(section: SectionId) {
	mutate((s) => {
		switch (section) {
			case 'intake':
				return { ...s, phase: 'intake', pauseEraId: null };
			case 't0': {
				if (!s.routing?.t0) return s;
				let eras = s.eras;
				if (eras.length === 0) {
					eras = [
						{
							id: newEraId(),
							name: '',
							scouting: {},
							bound: {},
							shadow: false
						}
					];
				}
				return { ...s, eras, phase: 't0', pauseEraId: null };
			}
			case 't1':
				return { ...s, phase: 't1', pauseEraId: null };
			case 't2':
				return { ...s, phase: 't2', pauseEraId: null };
			case 't3': {
				if (!s.routing?.t3 || s.routing.finalForm) return s;
				const horizon =
					s.horizonIncluded === true && s.horizon && Object.keys(s.horizon).length > 0
						? s.horizon
						: {};
				return {
					...s,
					horizonIncluded: true,
					horizon,
					phase: 't3',
					pauseEraId: null
				};
			}
			default:
				return s;
		}
	}, 'phase');
}

/** @deprecated Use finishPhase / continueFromPause instead. */
export function advanceFrom(phase: Phase) {
	if (phase === 't0') finishPhase('t0');
	else if (phase === 't1') finishPhase('t1');
	else if (phase === 't2') finishPhase('t2');
	else if (phase === 't3') finishPhase('t3');
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
	}, 'phase');
}

export function removeEra(id: string) {
	mutate((s) => {
		if (s.eras.length <= 1) return s;
		return { ...s, eras: s.eras.filter((e) => e.id !== id) };
	}, 'phase');
}

export function updateEraName(id: string, name: string) {
	mutate((s) => ({
		...s,
		eras: s.eras.map((e) => (e.id === id ? { ...e, name } : e))
	}), 'answer');
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
	}), 'answer');
}

export function setEraShadow(eraId: string, shadow: boolean) {
	mutate((s) => ({
		...s,
		eras: s.eras.map((e) => (e.id === eraId ? { ...e, shadow } : e))
	}), 'answer');
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
	}), 'answer');
}

export function setPresentShadow(shadow: boolean) {
	mutate((s) => ({
		...s,
		present: { ...s.present, shadow }
	}), 'answer');
}

export function setAspirationAnswer(questionId: string, value: LikertValue) {
	mutate((s) => ({
		...s,
		aspiration: { ...s.aspiration, [questionId]: value }
	}), 'answer');
}

export function setHorizonAnswer(questionId: string, value: LikertValue) {
	mutate((s) => ({
		...s,
		horizon: { ...(s.horizon ?? {}), [questionId]: value }
	}), 'answer');
}

/** Debug helper */
export function peekSurveyStorage(): string | null {
	if (typeof localStorage === 'undefined') return null;
	return localStorage.getItem(STORAGE_KEY);
}

export function peekSurveyPhase(): Phase {
	return get(survey).phase;
}

export type { Answers, DualModeAnswers, Era, SurveyState } from './types';
