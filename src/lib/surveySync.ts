import { get } from 'svelte/store';
import { survey } from './store';
import type { SurveyState } from './types';

export const RESPONSE_ID_KEY = 'eros-vector-response-id';

export type SurveySyncEvent = 'start' | 'answer' | 'phase' | 'complete';

function readResponseId(): string | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		return localStorage.getItem(RESPONSE_ID_KEY);
	} catch {
		return null;
	}
}

function writeResponseId(id: string) {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(RESPONSE_ID_KEY, id);
	} catch {
		// ignore
	}
}

export function clearResponseId() {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.removeItem(RESPONSE_ID_KEY);
	} catch {
		// ignore
	}
}

let inflight: Promise<void> | null = null;
let queued: { state: SurveyState; event: SurveySyncEvent } | null = null;

async function postSync(state: SurveyState, event: SurveySyncEvent): Promise<void> {
	const responseId = readResponseId();
	const res = await fetch('/api/survey/sync', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		credentials: 'same-origin',
		body: JSON.stringify({ responseId, state, event })
	});
	if (!res.ok) return;
	const data = (await res.json()) as { responseId?: string };
	if (typeof data.responseId === 'string' && data.responseId) {
		writeResponseId(data.responseId);
	}
}

async function drain(): Promise<void> {
	while (queued) {
		const next = queued;
		queued = null;
		try {
			await postSync(next.state, next.event);
		} catch {
			// localStorage remains authoritative — never block UX
		}
	}
	inflight = null;
}

/** Fire-and-forget upsert of survey state; coalesces rapid successive calls. */
export function queueSurveySync(event: SurveySyncEvent, state?: SurveyState) {
	if (typeof fetch === 'undefined') return;
	queued = { state: state ?? get(survey), event };
	if (!inflight) {
		inflight = drain();
	}
}
