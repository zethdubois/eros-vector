import type { RequestHandler } from '@sveltejs/kit';
import { hasAtLeast } from '$lib/server/access';

/** Temporary: dump request headers so we can see what Replit's proxy injects. */
export const GET: RequestHandler = ({ request, locals }) => {
	if (!hasAtLeast(locals.accessRole, 'reviewer')) {
		return new Response('Forbidden', { status: 403 });
	}
	const headers: Record<string, string> = {};
	request.headers.forEach((value, key) => {
		headers[key] = value;
	});
	return new Response(JSON.stringify(headers, null, 2), {
		headers: { 'Content-Type': 'application/json' }
	});
};
