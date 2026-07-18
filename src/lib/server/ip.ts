import { createHmac } from 'node:crypto';
import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';

function ipHashSecret(): string {
	return env.IP_HASH_SECRET?.trim() || env.ACCESS_COOKIE_SECRET?.trim() || '';
}

/** Extract client IP from SvelteKit / reverse-proxy headers. Never persist the result. */
export function clientIp(event: RequestEvent): string | null {
	try {
		const fromKit = event.getClientAddress();
		if (fromKit) return fromKit;
	} catch {
		// getClientAddress can throw when the adapter has no address
	}

	const forwarded = event.request.headers.get('x-forwarded-for');
	if (forwarded) {
		const first = forwarded.split(',')[0]?.trim();
		if (first) return first;
	}

	return event.request.headers.get('x-real-ip')?.trim() || null;
}

/** Salted HMAC of IP — reversible only with the secret; raw IP is discarded. */
export function hashIp(ip: string | null | undefined): string | null {
	if (!ip) return null;
	const secret = ipHashSecret();
	if (!secret) return null;
	return createHmac('sha256', secret).update(ip).digest('base64url');
}

/**
 * Coarse region from platform geo headers when present.
 * No paid/external geo lookup — falls back to null.
 */
export function coarseRegion(event: RequestEvent): string | null {
	const headers = event.request.headers;
	const country =
		headers.get('cf-ipcountry') ||
		headers.get('x-vercel-ip-country') ||
		headers.get('x-country-code') ||
		headers.get('cloudfront-viewer-country');

	if (!country || country === 'XX' || country === 'T1') return null;

	const region =
		headers.get('cf-region') ||
		headers.get('x-vercel-ip-country-region') ||
		headers.get('x-region-code');

	const normalizedCountry = country.trim().toUpperCase();
	if (!region) return normalizedCountry;

	return `${normalizedCountry}-${region.trim().toUpperCase()}`;
}

/** Short UA token for analytics — not a fingerprint. */
export function summarizeUserAgent(ua: string | null): string | null {
	if (!ua) return null;
	const trimmed = ua.trim().slice(0, 180);
	if (!trimmed) return null;

	let family = 'other';
	if (/Edg\//i.test(trimmed)) family = 'edge';
	else if (/Chrome\//i.test(trimmed) && !/Chromium/i.test(trimmed)) family = 'chrome';
	else if (/Firefox\//i.test(trimmed)) family = 'firefox';
	else if (/Safari\//i.test(trimmed) && !/Chrome/i.test(trimmed)) family = 'safari';

	let os = 'other';
	if (/Windows/i.test(trimmed)) os = 'windows';
	else if (/Android/i.test(trimmed)) os = 'android';
	else if (/iPhone|iPad|iOS/i.test(trimmed)) os = 'ios';
	else if (/Mac OS X|Macintosh/i.test(trimmed)) os = 'mac';
	else if (/Linux/i.test(trimmed)) os = 'linux';

	return `${family}/${os}`;
}
