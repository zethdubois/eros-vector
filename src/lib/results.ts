import { resolveArchetype, type Archetype } from './labels';
import { deepDiveQuestions, quickVibeQuestions } from './questions';
import { scoreAnswers } from './scoring';
import type { Answers, Coordinates, Question, SurveyState } from './types';

export type ResultMode = 'scouting' | 'bound';

export type ResultPass = {
	mode: ResultMode;
	profileLabel: string;
	archetype: Archetype;
	coordinates: Coordinates;
	shadow?: boolean;
};

export type ResultSection = {
	id: string;
	phaseLabel: string;
	context?: string;
	passes: ResultPass[];
};

export type BillboardLine = {
	phaseName: string;
	verb: 'were' | 'are' | 'will be';
	passes: ResultPass[];
};

function toPass(
	mode: ResultMode,
	answers: Answers,
	questions: Question[],
	shadow?: boolean
): ResultPass {
	const coordinates = scoreAnswers(answers, questions);
	const archetype = resolveArchetype(coordinates);
	return {
		mode,
		profileLabel: archetype.name,
		archetype,
		coordinates,
		shadow
	};
}

function eraBillboardLine(state: SurveyState, eraId: string): BillboardLine | null {
	const era = state.eras.find((e) => e.id === eraId);
	if (!era) return null;
	return {
		phaseName: era.name.trim() || 'Untitled era',
		verb: 'were',
		passes: [
			toPass('scouting', era.scouting, quickVibeQuestions),
			toPass('bound', era.bound, quickVibeQuestions, era.shadow)
		]
	};
}

export function buildBillboardLines(state: SurveyState): BillboardLine[] {
	switch (state.phase) {
		case 'pause-t0': {
			if (!state.pauseEraId) return [];
			const line = eraBillboardLine(state, state.pauseEraId);
			return line ? [line] : [];
		}
		case 'pause-t1':
			return [
				{
					phaseName: 'Present',
					verb: 'are',
					passes: [
						toPass('scouting', state.present.scouting, deepDiveQuestions),
						toPass('bound', state.present.bound, deepDiveQuestions, state.present.shadow)
					]
				}
			];
		case 'pause-t2':
			return [
				{
					phaseName: state.routing?.finalForm ? 'Final Form' : 'Aspiration',
					verb: 'are',
					passes: [toPass('bound', state.aspiration, deepDiveQuestions)]
				}
			];
		case 'pause-t3':
			if (!state.horizon) return [];
			return [
				{
					phaseName: 'Horizon',
					verb: 'will be',
					passes: [toPass('bound', state.horizon, deepDiveQuestions)]
				}
			];
		default:
			return [];
	}
}

/** Build labeled result passes grouped by time layer. */
export function buildResultSections(state: SurveyState): ResultSection[] {
	const sections: ResultSection[] = [];

	for (const era of state.eras) {
		sections.push({
			id: `t0-${era.id}`,
			phaseLabel: 'Past eras',
			context: era.name || 'Untitled era',
			passes: [
				toPass('scouting', era.scouting, quickVibeQuestions),
				toPass('bound', era.bound, quickVibeQuestions, era.shadow)
			]
		});
	}

	sections.push({
		id: 't1',
		phaseLabel: 'Present',
		context: 'Where you are now in your relational life.',
		passes: [
			toPass('scouting', state.present.scouting, deepDiveQuestions),
			toPass('bound', state.present.bound, deepDiveQuestions, state.present.shadow)
		]
	});

	if (state.routing?.finalForm) {
		sections.push({
			id: 'final-form',
			phaseLabel: 'Final Form',
			context: 'Your long-range relational architecture — aspiration and horizon together.',
			passes: [toPass('bound', state.aspiration, deepDiveQuestions)]
		});
	} else {
		sections.push({
			id: 't2',
			phaseLabel: 'Aspiration',
			context: 'The pair-bond structure you want to build toward.',
			passes: [toPass('bound', state.aspiration, deepDiveQuestions)]
		});

		if (state.horizonIncluded === true && state.horizon) {
			sections.push({
				id: 't3',
				phaseLabel: 'Horizon',
				context: 'Where you imagine yourself long-term.',
				passes: [toPass('bound', state.horizon, deepDiveQuestions)]
			});
		}
	}

	return sections;
}

/** Sections through aspiration — used before optional horizon. */
export function buildPartialResultSections(state: SurveyState): ResultSection[] {
	return buildResultSections({ ...state, horizonIncluded: false, horizon: null });
}
