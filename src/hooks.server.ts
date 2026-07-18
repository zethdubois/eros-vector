import { redirect, type Handle } from '@sveltejs/kit';
import { hasAtLeast, readAccessRole, safeNextPath } from '$lib/server/access';
import { ensureVisitorContext } from '$lib/server/visitor';

function isStaticAsset(pathname: string): boolean {
	if (pathname.startsWith('/_app/')) return true;
	if (pathname.startsWith('/img/')) return true;
	if (pathname === '/favicon.ico') return true;
	return false;
}

function isUnauthedPath(pathname: string): boolean {
	if (pathname === '/access' || pathname.startsWith('/access/')) return true;
	if (pathname === '/legal' || pathname.startsWith('/legal/')) return true;
	if (isStaticAsset(pathname)) return true;
	return false;
}

function shouldTrackVisitor(pathname: string): boolean {
	if (isStaticAsset(pathname)) return false;
	if (pathname.startsWith('/api/')) return true;
	return true;
}

export const handle: Handle = async ({ event, resolve }) => {
	const role = readAccessRole(event.cookies);
	event.locals.accessRole = role;
	event.locals.visitorId = null;
	event.locals.sessionId = null;

	const { pathname } = event.url;

	const track =
		shouldTrackVisitor(pathname) &&
		(isUnauthedPath(pathname) || hasAtLeast(role, 'beta'));

	if (track) {
		const ctx = await ensureVisitorContext(event);
		if (ctx) {
			event.locals.visitorId = ctx.visitorId;
			event.locals.sessionId = ctx.sessionId;
		}
	}

	if (isUnauthedPath(pathname)) {
		return resolve(event);
	}

	// Backstage: reviewer or developer (not viewer-only)
	if (pathname === '/backstage' || pathname.startsWith('/backstage/')) {
		if (!hasAtLeast(role, 'reviewer')) {
			const next = encodeURIComponent(safeNextPath(pathname));
			redirect(303, `/access?next=${next}&upgrade=backstage`);
		}
		return resolve(event);
	}

	// Public app: any valid invite password (beta, reviewer, or developer)
	if (!hasAtLeast(role, 'beta')) {
		const next = encodeURIComponent(safeNextPath(pathname + event.url.search));
		redirect(303, `/access?next=${next}`);
	}

	return resolve(event);
};
