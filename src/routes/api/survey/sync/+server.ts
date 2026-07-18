import { error, json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { hasAtLeast } from '$lib/server/access';
import { getDb } from '$lib/server/db';
import { surveyResponses } from '$lib/server/db/schema';
import { loadQuestionBanks } from '$lib/server/db/catalog';
import { buildResultSections } from '$lib/results';
import { parseStoredState } from '$lib/surveyState';
import type { RequestHandler } from './$types';

const MAX_BODY_BYTES = 400_000;
const SYNC_EVENTS = new Set(['answer', 'phase', 'complete', 'start']);

function isUuid(value: unknown): value is string {
	return (
		typeof value === 'string' &&
		/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
	);
}

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!hasAtLeast(locals.accessRole, 'beta')) {
		error(401, 'Authentication required');
	}
	if (!locals.visitorId) {
		error(503, 'Visitor tracking unavailable');
	}

	const raw = await request.text();
	if (raw.length > MAX_BODY_BYTES) {
		error(413, 'Payload too large');
	}

	let body: unknown;
	try {
		body = JSON.parse(raw);
	} catch {
		error(400, 'Invalid JSON');
	}

	if (!body || typeof body !== 'object') {
		error(400, 'Invalid body');
	}

	const { responseId, state, event: syncEvent } = body as {
		responseId?: unknown;
		state?: unknown;
		event?: unknown;
	};

	if (typeof syncEvent !== 'string' || !SYNC_EVENTS.has(syncEvent)) {
		error(400, 'Invalid event');
	}

	const stateJson = JSON.stringify(state ?? null);
	const parsed = parseStoredState(stateJson);
	if (!parsed) {
		error(400, 'Invalid survey state');
	}

	const now = new Date();
	const status = parsed.phase === 'complete' || syncEvent === 'complete' ? 'complete' : 'in_progress';
	let results: unknown = null;

	if (status === 'complete') {
		try {
			const banks = await loadQuestionBanks();
			results = buildResultSections(parsed, banks);
		} catch (err) {
			console.error('Failed to compute survey results for sync', err);
			results = null;
		}
	}

	const db = getDb();
	const visitorId = locals.visitorId;
	const sessionId = locals.sessionId;

	try {
		if (isUuid(responseId)) {
			const [existing] = await db
				.select({
					id: surveyResponses.id,
					visitorId: surveyResponses.visitorId,
					status: surveyResponses.status
				})
				.from(surveyResponses)
				.where(and(eq(surveyResponses.id, responseId), eq(surveyResponses.visitorId, visitorId)))
				.limit(1);

			if (existing) {
				const [updated] = await db
					.update(surveyResponses)
					.set({
						sessionId: sessionId ?? undefined,
						status: existing.status === 'complete' ? 'complete' : status,
						phase: parsed.phase,
						state: parsed,
						results: status === 'complete' ? results : undefined,
						updatedAt: now,
						completedAt: status === 'complete' ? now : undefined
					})
					.where(eq(surveyResponses.id, existing.id))
					.returning({ id: surveyResponses.id });

				return json({ responseId: updated.id });
			}
		}

		const [created] = await db
			.insert(surveyResponses)
			.values({
				visitorId,
				sessionId: sessionId ?? null,
				status,
				phase: parsed.phase,
				state: parsed,
				results: status === 'complete' ? results : null,
				startedAt: now,
				updatedAt: now,
				completedAt: status === 'complete' ? now : null
			})
			.returning({ id: surveyResponses.id });

		return json({ responseId: created.id });
	} catch (err) {
		console.error('survey sync failed', err);
		error(503, 'Survey sync unavailable');
	}
};
