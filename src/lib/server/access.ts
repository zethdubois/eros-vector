import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';

/** viewer = public app; readonly/developer = public app + backstage (dev can mutate). */
export type AccessRole = 'viewer' | 'readonly' | 'developer';

export const ACCESS_COOKIE = 'eros_access';
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

const ROLE_RANK: Record<AccessRole, number> = {
	viewer: 1,
	readonly: 2,
	developer: 3
};

type CookiePayload = {
	role: AccessRole;
	exp: number;
};

function cookieSecret(): string {
	return env.ACCESS_COOKIE_SECRET?.trim() ?? '';
}

function viewerPassword(): string {
	return env.ACCESS_PASSWORD_VIEWER?.trim() ?? '';
}

function readonlyPassword(): string {
	return env.ACCESS_PASSWORD_READONLY?.trim() ?? '';
}

function developerPassword(): string {
	return env.ACCESS_PASSWORD_DEVELOPER?.trim() ?? '';
}

/** True when env secrets required for gating are present. */
export function accessConfigured(): boolean {
	return Boolean(
		cookieSecret() && (viewerPassword() || readonlyPassword() || developerPassword())
	);
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

function isAccessRole(value: unknown): value is AccessRole {
	return value === 'viewer' || value === 'readonly' || value === 'developer';
}

/** Map a submitted password to a role, or null if invalid. */
export function roleForPassword(password: string): AccessRole | null {
	const submitted = password.trim();
	if (!submitted) return null;

	// Highest tier first if secrets were accidentally duplicated.
	const developer = developerPassword();
	if (developer && safeEqual(submitted, developer)) return 'developer';

	const readonly = readonlyPassword();
	if (readonly && safeEqual(submitted, readonly)) return 'readonly';

	const viewer = viewerPassword();
	if (viewer && safeEqual(submitted, viewer)) return 'viewer';

	return null;
}

function sign(body: string): string {
	return createHmac('sha256', cookieSecret()).update(body).digest('base64url');
}

function encodeCookie(payload: CookiePayload): string {
	const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
	return `${body}.${sign(body)}`;
}

function decodeCookie(value: string): CookiePayload | null {
	const secret = cookieSecret();
	if (!secret) return null;

	const [body, signature] = value.split('.');
	if (!body || !signature) return null;

	const expected = sign(body);
	if (!safeEqual(signature, expected)) return null;

	try {
		const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as CookiePayload;
		if (!isAccessRole(payload.role)) return null;
		if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
		return payload;
	} catch {
		return null;
	}
}

export function readAccessRole(cookies: Cookies): AccessRole | null {
	const raw = cookies.get(ACCESS_COOKIE);
	if (!raw) return null;
	return decodeCookie(raw)?.role ?? null;
}

export function setAccessCookie(cookies: Cookies, role: AccessRole) {
	const exp = Date.now() + COOKIE_MAX_AGE_SEC * 1000;
	cookies.set(ACCESS_COOKIE, encodeCookie({ role, exp }), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: COOKIE_MAX_AGE_SEC
	});
}

export function clearAccessCookie(cookies: Cookies) {
	cookies.delete(ACCESS_COOKIE, { path: '/' });
}

export function hasAtLeast(role: AccessRole | null, needed: AccessRole): boolean {
	if (!role) return false;
	return ROLE_RANK[role] >= ROLE_RANK[needed];
}

/** Only allow same-origin relative paths for post-login redirects. */
export function safeNextPath(next: string | null | undefined, fallback = '/'): string {
	if (!next) return fallback;
	const trimmed = next.trim();
	if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
		return fallback;
	}
	return trimmed;
}

// --- simple in-memory login throttle ---
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 12;
const WINDOW_MS = 15 * 60 * 1000;

export function loginAllowed(ip: string): boolean {
	const now = Date.now();
	const entry = attempts.get(ip);
	if (!entry || entry.resetAt < now) {
		attempts.set(ip, { count: 0, resetAt: now + WINDOW_MS });
		return true;
	}
	return entry.count < MAX_ATTEMPTS;
}

export function recordLoginFailure(ip: string) {
	const now = Date.now();
	const entry = attempts.get(ip);
	if (!entry || entry.resetAt < now) {
		attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
		return;
	}
	entry.count += 1;
}
