import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	accessConfigured,
	clearAccessCookie,
	hasAtLeast,
	loginAllowed,
	recordLoginFailure,
	roleForPassword,
	safeNextPath,
	setAccessCookie
} from '$lib/server/access';

export const load: PageServerLoad = async ({ locals, url }) => {
	const next = safeNextPath(url.searchParams.get('next'));
	const upgradingBackstage =
		next.startsWith('/backstage') && !hasAtLeast(locals.accessRole, 'readonly');

	if (locals.accessRole && !upgradingBackstage) {
		redirect(303, next === '/access' ? '/' : next);
	}
	return {
		configured: accessConfigured(),
		next,
		upgradingBackstage
	};
};

export const actions: Actions = {
	login: async ({ request, cookies, getClientAddress }) => {
		const form = await request.formData();
		const next = safeNextPath(String(form.get('next') ?? '/'));

		if (!accessConfigured()) {
			return fail(503, { error: 'Access is not configured on this server.', next });
		}

		const ip = getClientAddress();
		if (!loginAllowed(ip)) {
			return fail(429, { error: 'Too many attempts. Try again later.', next });
		}

		const password = String(form.get('password') ?? '');

		const role = roleForPassword(password);
		if (!role) {
			recordLoginFailure(ip);
			return fail(401, { error: 'Invalid password.', next });
		}
		if (next.startsWith('/backstage') && !hasAtLeast(role, 'readonly')) {
			recordLoginFailure(ip);
			return fail(403, {
				error: 'That password only unlocks the public survey. Enter a backstage password.',
				next
			});
		}

		setAccessCookie(cookies, role);
		redirect(303, next);
	},

	logout: async ({ cookies }) => {
		clearAccessCookie(cookies);
		redirect(303, '/access');
	}
};
