import { writable } from 'svelte/store';
import { computeRouting } from './routing';
import type { Answers, DualModeAnswers, Era, LikertValue, Phase, SurveyState } from './types';

function emptyDual(): DualModeAnswers {
	return { scouting: {}, bound: {}, shadow: false };
}

function createInitialState(): SurveyState {
	return {
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

export const survey = writable<SurveyState>(createInitialState());

export function resetSurvey() {
	survey.set(createInitialState());
}

export function submitIntake(chronAge: number, awakeAge: number) {
	const { intake, routing } = computeRouting(chronAge, awakeAge);
	survey.update((s) => ({
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
	survey.update((s) => ({ ...s, phase }));
}

/** Advance after completing a phase, following routing. */
export function advanceFrom(phase: Phase) {
	survey.update((s) => {
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
	survey.update((s) => {
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
	survey.update((s) => {
		if (s.eras.length <= 1) return s;
		return { ...s, eras: s.eras.filter((e) => e.id !== id) };
	});
}

export function updateEraName(id: string, name: string) {
	survey.update((s) => ({
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
	survey.update((s) => ({
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
	survey.update((s) => ({
		...s,
		eras: s.eras.map((e) => (e.id === eraId ? { ...e, shadow } : e))
	}));
}

export function setPresentAnswer(
	mode: 'scouting' | 'bound',
	questionId: string,
	value: LikertValue
) {
	survey.update((s) => ({
		...s,
		present: {
			...s.present,
			[mode]: { ...s.present[mode], [questionId]: value }
		}
	}));
}

export function setPresentShadow(shadow: boolean) {
	survey.update((s) => ({
		...s,
		present: { ...s.present, shadow }
	}));
}

export function setAspirationAnswer(questionId: string, value: LikertValue) {
	survey.update((s) => ({
		...s,
		aspiration: { ...s.aspiration, [questionId]: value }
	}));
}

export function setHorizonAnswer(questionId: string, value: LikertValue) {
	survey.update((s) => ({
		...s,
		horizon: { ...(s.horizon ?? {}), [questionId]: value }
	}));
}

export type { Answers, DualModeAnswers, Era, SurveyState };
