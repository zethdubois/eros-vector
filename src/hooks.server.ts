import { redirect, type Handle } from '@sveltejs/kit';
import { hasAtLeast, readAccessRole, safeNextPath } from '$lib/server/access';

function isUnauthedPath(pathname: string): boolean {
	if (pathname === '/access' || pathname.startsWith('/access/')) return true;
	if (pathname.startsWith('/_app/')) return true;
	if (pathname.startsWith('/img/')) return true;
	if (pathname === '/favicon.ico') return true;
	return false;
}

export const handle: Handle = async ({ event, resolve }) => {
	const role = readAccessRole(event.cookies);
	event.locals.accessRole = role;

	const { pathname } = event.url;

	if (isUnauthedPath(pathname)) {
		return resolve(event);
	}

	// Backstage: readonly or developer (not viewer-only)
	if (pathname === '/backstage' || pathname.startsWith('/backstage/')) {
		if (!hasAtLeast(role, 'readonly')) {
			const next = encodeURIComponent(safeNextPath(pathname));
			redirect(303, `/access?next=${next}&upgrade=backstage`);
		}
		return resolve(event);
	}

	// Public app: any valid invite password (viewer, readonly, or developer)
	if (!hasAtLeast(role, 'viewer')) {
		const next = encodeURIComponent(safeNextPath(pathname + event.url.search));
		redirect(303, `/access?next=${next}`);
	}

	return resolve(event);
};
