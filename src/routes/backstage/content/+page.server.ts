import { redirect } from '@sveltejs/kit';
import { CONTENT_NAV } from '$lib/server/contentCatalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	redirect(303, `/backstage/content/${CONTENT_NAV[0].slug}`);
};
