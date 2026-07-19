import { redirect } from '@sveltejs/kit';
import { listWikiArticles } from '$lib/server/wiki';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const articles = listWikiArticles();
	if (articles.length > 0) {
		redirect(303, `/backstage/wiki/${articles[0].slug}`);
	}
	return { empty: true };
};
