import { error } from '@sveltejs/kit';
import { loadQuestionBanks } from '$lib/server/db/catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const banks = await loadQuestionBanks();
		return { banks };
	} catch (err) {
		console.error('Failed to load survey question catalog', err);
		error(503, 'Survey questions are unavailable. Check DATABASE_URL and run migrations/seed.');
	}
};
