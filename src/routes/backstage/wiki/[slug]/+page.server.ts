import { error } from '@sveltejs/kit';
import { loadWikiArticle } from '$lib/server/wiki';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const article = await loadWikiArticle(params.slug);
	if (!article) error(404, 'Article not found');
	return { article };
};
