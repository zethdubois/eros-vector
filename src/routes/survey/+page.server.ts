import { error } from '@sveltejs/kit';
import { loadQuestionBanks } from '$lib/server/db/catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const banks = await loadQuestionBanks();
		return { banks };
	} catch (err) {
		console.error('Failed to load survey question catalog', err);
		error(
			503,
			'Survey questions are unavailable. For local Railway access set DATABASE_PUBLIC_URL to the public proxy URL, then run migrations/seed.'
		);
	}
};
