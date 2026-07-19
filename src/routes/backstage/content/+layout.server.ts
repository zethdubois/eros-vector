import { CONTENT_NAV } from '$lib/server/contentCatalog';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	return { tables: CONTENT_NAV };
};
