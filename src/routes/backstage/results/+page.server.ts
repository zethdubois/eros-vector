import { error, fail } from '@sveltejs/kit';
import { desc, eq, inArray } from 'drizzle-orm';
import { hasAtLeast } from '$lib/server/access';
import { getDb } from '$lib/server/db';
import { surveyResponses, visitors } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAtLeast(locals.accessRole, 'reviewer')) {
		error(403, 'Access denied');
	}

	const db = getDb();
	const rows = await db
		.select({
			id: surveyResponses.id,
			role: surveyResponses.role,
			status: surveyResponses.status,
			phase: surveyResponses.phase,
			startedAt: surveyResponses.startedAt,
			updatedAt: surveyResponses.updatedAt,
			completedAt: surveyResponses.completedAt,
			visitorId: surveyResponses.visitorId,
			visitorRegion: visitors.lastRegion,
			visitorUa: visitors.userAgentSummary,
			state: surveyResponses.state,
			results: surveyResponses.results
		})
		.from(surveyResponses)
		.leftJoin(visitors, eq(surveyResponses.visitorId, visitors.id))
		.orderBy(desc(surveyResponses.startedAt));

	return {
		rows,
		canDelete: locals.accessRole === 'developer'
	};
};

export const actions: Actions = {
	deleteRows: async ({ request, locals }) => {
		if (!hasAtLeast(locals.accessRole, 'developer')) {
			return fail(403, { ok: false as const, error: 'Developer access required.' });
		}

		const form = await request.formData();
		const raw = form.get('ids');
		if (typeof raw !== 'string' || !raw.trim()) {
			return fail(400, { ok: false as const, error: 'No IDs provided.' });
		}

		const ids = raw
			.split(',')
			.map((s) => s.trim())
			.filter((s) =>
				/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)
			);

		if (ids.length === 0) {
			return fail(400, { ok: false as const, error: 'No valid IDs provided.' });
		}

		try {
			const db = getDb();
			const deleted = await db
				.delete(surveyResponses)
				.where(inArray(surveyResponses.id, ids))
				.returning({ id: surveyResponses.id });

			return { ok: true as const, deletedCount: deleted.length };
		} catch (err) {
			console.error('deleteRows failed', err);
			return fail(503, { ok: false as const, error: 'Delete failed — check DB connectivity.' });
		}
	}
};
