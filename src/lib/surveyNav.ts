import type { Phase, SurveyState } from './types';

export type SectionId = 'intake' | 't0' | 't1' | 't2' | 't3';

export function activeSection(phase: Phase): SectionId | null {
	switch (phase) {
		case 'intake':
			return 'intake';
		case 't0':
		case 'pause-t0':
			return 't0';
		case 't1':
		case 'pause-t1':
			return 't1';
		case 't2':
		case 'pause-t2':
			return 't2';
		case 't3':
		case 'pause-t3':
			return 't3';
		case 'complete':
			return null;
	}
}

/** Breadcrumb order for the current routing. */
export function sectionOrder(state: SurveyState): SectionId[] {
	const order: SectionId[] = ['intake'];
	if (state.routing?.t0) order.push('t0');
	order.push('t1');
	if (state.routing?.finalForm) {
		order.push('t2');
	} else {
		order.push('t2');
		if (state.routing?.t3) order.push('t3');
	}
	return order;
}

/** Highest section index the user has reached in the flow. */
export function maxSectionIndex(state: SurveyState): number {
	const order = sectionOrder(state);
	if (state.phase === 'complete') return order.length - 1;

	if (state.phase.startsWith('pause-')) {
		const id = state.phase.slice(6) as SectionId;
		const i = order.indexOf(id);
		return i >= 0 ? i : 0;
	}

	const active = activeSection(state.phase);
	return active ? order.indexOf(active) : 0;
}

export function isPastSkipped(state: SurveyState): boolean {
	return (
		!!state.routing?.t0 &&
		state.eras.length === 0 &&
		state.phase !== 't0' &&
		state.phase !== 'pause-t0' &&
		state.phase !== 'intake'
	);
}

export function isHorizonSkipped(state: SurveyState): boolean {
	return !!state.routing?.t3 && state.horizonIncluded === false;
}

export function canAddPastEras(state: SurveyState): boolean {
	return !!state.routing?.t0 && state.eras.length < 4;
}

export function canAddHorizon(state: SurveyState): boolean {
	return !!state.routing?.t3 && !state.routing.finalForm && state.horizonIncluded === false;
}

/** Whether the user can jump to this section from breadcrumbs. */
export function canNavigateToSection(state: SurveyState, target: SectionId): boolean {
	const order = sectionOrder(state);
	const targetIdx = order.indexOf(target);
	if (targetIdx < 0) return false;

	const active = activeSection(state.phase);
	const onTarget = active === target && !state.phase.startsWith('pause-');
	if (onTarget) return false;

	if (target === 't0' && isPastSkipped(state)) return true;
	if (target === 't3' && isHorizonSkipped(state)) return true;

	if (state.phase === 'complete') return true;

	return targetIdx <= maxSectionIndex(state);
}

export function sectionNavLabel(id: SectionId, state: SurveyState): string {
	switch (id) {
		case 'intake':
			return 'Intake';
		case 't0':
			return 'Past';
		case 't1':
			return 'Present';
		case 't2':
			return state.routing?.finalForm ? 'Final Form' : 'Aspiration';
		case 't3':
			return 'Horizon';
	}
}
