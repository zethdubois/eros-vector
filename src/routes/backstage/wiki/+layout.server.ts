import { listWikiArticles } from '$lib/server/wiki';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	return { articles: listWikiArticles() };
};
