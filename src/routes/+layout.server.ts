import type { LayoutServerLoad } from './$types';
import { hasAtLeast } from '$lib/server/access';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		accessRole: locals.accessRole,
		canAccessBackstage: hasAtLeast(locals.accessRole, 'readonly')
	};
};
