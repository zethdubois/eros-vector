import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { role } = await parent();
	return { role };
};
