import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';
import type { Cookies, RequestEvent } from '@sveltejs/kit';
import { and, eq, gt } from 'drizzle-orm';
import { getDb } from './db';
import { visitorSessions, visitors } from './db/schema';
import { clientIp, coarseRegion, hashIp, summarizeUserAgent } from './ip';

export const VISITOR_COOKIE = 'ev_visitor';
export const SESSION_COOKIE = 'ev_session';

const VISITOR_MAX_AGE_SEC = 60 * 60 * 24 * 400; // ~13 months
const SESSION_IDLE_MS = 30 * 60 * 1000; // 30 minutes
const LAST_SEEN_THROTTLE_MS = 15 * 60 * 1000; // 15 minutes

type IdPayload = {
	id: string;
	exp: number;
};

function cookieSecret(): string {
	return env.ACCESS_COOKIE_SECRET?.trim() ?? '';
}

function safeEqual(a: string, b: string): boolean {
	if (!a || !b) return false;
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	if (bufA.length !== bufB.length) {
		timingSafeEqual(bufA, bufA);
		return false;
	}
	return timingSafeEqual(bufA, bufB);
}

function sign(body: string): string {
	return createHmac('sha256', cookieSecret()).update(body).digest('base64url');
}

function encodeIdCookie(payload: IdPayload): string {
	const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
	return `${body}.${sign(body)}`;
}

function decodeIdCookie(value: string): string | null {
	if (!cookieSecret()) return null;
	const [body, signature] = value.split('.');
	if (!body || !signature) return null;
	if (!safeEqual(signature, sign(body))) return null;

	try {
		const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as IdPayload;
		if (typeof payload.id !== 'string' || !payload.id) return null;
		if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
		return payload.id;
	} catch {
		return null;
	}
}

function setIdCookie(cookies: Cookies, name: string, id: string, maxAgeSec: number) {
	const exp = Date.now() + maxAgeSec * 1000;
	cookies.set(name, encodeIdCookie({ id, exp }), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: maxAgeSec
	});
}

function isUuid(value: string): boolean {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
		value
	);
}

export type VisitorContext = {
	visitorId: string;
	sessionId: string;
};

/**
 * Ensure anonymous visitor + session cookies/rows exist.
 * Never throws to the request path — DB failures are logged and skipped.
 */
export async function ensureVisitorContext(event: RequestEvent): Promise<VisitorContext | null> {
	if (!cookieSecret()) return null;

	const now = new Date();
	const region = coarseRegion(event);
	if (!region) {
		const allHeaders: Record<string, string> = {};
		event.request.headers.forEach((v, k) => { allHeaders[k] = v; });
		console.log('[geo-debug] no region detected. headers:', JSON.stringify(allHeaders));
	}
	const ipHash = hashIp(clientIp(event));
	const uaSummary = summarizeUserAgent(event.request.headers.get('user-agent'));
	const landingPath = `${event.url.pathname}${event.url.search}`.slice(0, 500);
	const referrer = event.request.headers.get('referer')?.slice(0, 500) || null;

	try {
		const db = getDb();

		let visitorId = decodeIdCookie(event.cookies.get(VISITOR_COOKIE) ?? '');
		if (!visitorId || !isUuid(visitorId)) {
			visitorId = randomUUID();
			await db.insert(visitors).values({
				id: visitorId,
				firstSeenAt: now,
				lastSeenAt: now,
				firstRegion: region,
				lastRegion: region,
				ipHash,
				userAgentSummary: uaSummary
			});
			setIdCookie(event.cookies, VISITOR_COOKIE, visitorId, VISITOR_MAX_AGE_SEC);
		} else {
			const [existing] = await db
				.select()
				.from(visitors)
				.where(eq(visitors.id, visitorId))
				.limit(1);

			if (!existing) {
				await db.insert(visitors).values({
					id: visitorId,
					firstSeenAt: now,
					lastSeenAt: now,
					firstRegion: region,
					lastRegion: region,
					ipHash,
					userAgentSummary: uaSummary
				});
			} else {
				const stale =
					now.getTime() - new Date(existing.lastSeenAt).getTime() >= LAST_SEEN_THROTTLE_MS;
				if (stale || (region && region !== existing.lastRegion) || (ipHash && !existing.ipHash)) {
					await db
						.update(visitors)
						.set({
							lastSeenAt: now,
							lastRegion: region ?? existing.lastRegion,
							ipHash: ipHash ?? existing.ipHash,
							userAgentSummary: uaSummary ?? existing.userAgentSummary
						})
						.where(eq(visitors.id, visitorId));
				}
			}
			// Refresh cookie expiry
			setIdCookie(event.cookies, VISITOR_COOKIE, visitorId, VISITOR_MAX_AGE_SEC);
		}

		let sessionId = decodeIdCookie(event.cookies.get(SESSION_COOKIE) ?? '');
		const sessionCutoff = new Date(now.getTime() - SESSION_IDLE_MS);
		let sessionOk = false;

		if (sessionId && isUuid(sessionId)) {
			const [session] = await db
				.select()
				.from(visitorSessions)
				.where(
					and(
						eq(visitorSessions.id, sessionId),
						eq(visitorSessions.visitorId, visitorId),
						gt(visitorSessions.lastActivityAt, sessionCutoff)
					)
				)
				.limit(1);
			if (session) {
				sessionOk = true;
				const stale =
					now.getTime() - new Date(session.lastActivityAt).getTime() >= LAST_SEEN_THROTTLE_MS;
				if (stale) {
					await db
						.update(visitorSessions)
						.set({ lastActivityAt: now, region: region ?? session.region })
						.where(eq(visitorSessions.id, sessionId));
				}
			}
		}

		if (!sessionOk) {
			sessionId = randomUUID();
			await db.insert(visitorSessions).values({
				id: sessionId,
				visitorId,
				startedAt: now,
				lastActivityAt: now,
				region,
				landingPath,
				referrer
			});
		}

		setIdCookie(event.cookies, SESSION_COOKIE, sessionId!, SESSION_IDLE_MS / 1000);

		return { visitorId, sessionId: sessionId! };
	} catch (err) {
		console.error('ensureVisitorContext failed', err);
		return null;
	}
}
