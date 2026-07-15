import { coordinateLabel } from './labels';
import { deepDiveQuestions, PHASE_BLURBS, quickVibeQuestions } from './questions';
import { scoreAnswers } from './scoring';
import type { Answers, Coordinates, Question, SurveyState } from './types';

export type ResultMode = 'scouting' | 'bound';

export type ResultPass = {
	mode: ResultMode;
	profileLabel: string;
	coordinates: Coordinates;
	shadow?: boolean;
};

export type ResultSection = {
	id: string;
	phaseLabel: string;
	context?: string;
	passes: ResultPass[];
};

function toPass(
	mode: ResultMode,
	answers: Answers,
	questions: Question[],
	shadow?: boolean
): ResultPass {
	const coordinates = scoreAnswers(answers, questions);
	return {
		mode,
		profileLabel: coordinateLabel(coordinates),
		coordinates,
		shadow
	};
}

/** Build labeled result passes grouped by time layer. */
export function buildResultSections(state: SurveyState): ResultSection[] {
	const sections: ResultSection[] = [];

	for (const era of state.eras) {
		sections.push({
			id: `t0-${era.id}`,
			phaseLabel: 'T0 — Past eras',
			context: era.name || 'Untitled era',
			passes: [
				toPass('scouting', era.scouting, quickVibeQuestions),
				toPass('bound', era.bound, quickVibeQuestions, era.shadow)
			]
		});
	}

	sections.push({
		id: 't1',
		phaseLabel: 'T1 — Present',
		context: PHASE_BLURBS.t1,
		passes: [
			toPass('scouting', state.present.scouting, deepDiveQuestions),
			toPass('bound', state.present.bound, deepDiveQuestions, state.present.shadow)
		]
	});

	if (state.routing?.finalForm) {
		sections.push({
			id: 'final-form',
			phaseLabel: 'Final Form',
			context: PHASE_BLURBS.finalForm,
			passes: [toPass('bound', state.aspiration, deepDiveQuestions)]
		});
	} else {
		sections.push({
			id: 't2',
			phaseLabel: 'T2 — Aspiration',
			context: PHASE_BLURBS.t2,
			passes: [toPass('bound', state.aspiration, deepDiveQuestions)]
		});

		if (state.horizon) {
			sections.push({
				id: 't3',
				phaseLabel: 'T3 — Horizon',
				context: PHASE_BLURBS.t3,
				passes: [toPass('bound', state.horizon, deepDiveQuestions)]
			});
		}
	}

	return sections;
}
