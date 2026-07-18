import { listWikiArticles } from '$lib/server/wiki';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { articles: listWikiArticles() };
};
