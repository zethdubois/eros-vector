import { createHmac } from 'node:crypto';
import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';

function ipHashSecret(): string {
	return env.IP_HASH_SECRET?.trim() || env.ACCESS_COOKIE_SECRET?.trim() || '';
}

const PRIVATE_IP_RE =
	/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|::1$|fc|fd|fe80)/i;

function isPrivateIp(ip: string): boolean {
	return PRIVATE_IP_RE.test(ip.trim());
}

/** Extract client IP from SvelteKit / reverse-proxy headers. Never persist the result. */
export function clientIp(event: RequestEvent): string | null {
	// x-forwarded-for carries the real client IP when behind a reverse proxy
	// (e.g. Replit's edge). Take the leftmost public IP from the chain before
	// falling back to getClientAddress(), which returns the proxy's internal IP.
	const forwarded = event.request.headers.get('x-forwarded-for');
	if (forwarded) {
		for (const part of forwarded.split(',')) {
			const ip = part.trim();
			if (ip && !isPrivateIp(ip)) return ip;
		}
	}

	const xReal = event.request.headers.get('x-real-ip')?.trim();
	if (xReal && !isPrivateIp(xReal)) return xReal;

	try {
		const fromKit = event.getClientAddress();
		if (fromKit) return fromKit;
	} catch {
		// getClientAddress can throw when the adapter has no address
	}

	return null;
}

/** Salted HMAC of IP — reversible only with the secret; raw IP is discarded. */
export function hashIp(ip: string | null | undefined): string | null {
	if (!ip) return null;
	const secret = ipHashSecret();
	if (!secret) return null;
	return createHmac('sha256', secret).update(ip).digest('base64url');
}

/**
 * Country (+region) from CDN geo headers when present.
 * Returns e.g. "US" or "US-CA", or null if no header found.
 */
function regionFromHeaders(headers: Headers): string | null {
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

// Simple TTL cache: ip → { result, expiresAt }
const geoCache = new Map<string, { result: string | null; expiresAt: number }>();
const GEO_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const GEO_LOOKUP_TIMEOUT_MS = 1500;

async function lookupIpRegion(ip: string): Promise<string | null> {
	// Skip private / loopback addresses
	if (/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fc|fd)/.test(ip)) return null;

	const cached = geoCache.get(ip);
	if (cached && cached.expiresAt > Date.now()) return cached.result;

	try {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), GEO_LOOKUP_TIMEOUT_MS);
		const res = await fetch(
			`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode,region`,
			{ signal: controller.signal }
		);
		clearTimeout(timer);

		if (!res.ok) {
			geoCache.set(ip, { result: null, expiresAt: Date.now() + GEO_CACHE_TTL_MS });
			return null;
		}

		const data = (await res.json()) as { status?: string; countryCode?: string; region?: string };
		let result: string | null = null;
		if (data.status === 'success' && data.countryCode) {
			result = data.region
				? `${data.countryCode.toUpperCase()}-${data.region.toUpperCase()}`
				: data.countryCode.toUpperCase();
		}
		geoCache.set(ip, { result, expiresAt: Date.now() + GEO_CACHE_TTL_MS });
		return result;
	} catch {
		geoCache.set(ip, { result: null, expiresAt: Date.now() + GEO_CACHE_TTL_MS });
		return null;
	}
}

/**
 * Coarse region string for analytics (e.g. "US" or "US-CA").
 * Prefers CDN geo headers; falls back to a free IP-API lookup.
 * Never throws — returns null on any failure.
 */
export async function coarseRegion(event: RequestEvent): Promise<string | null> {
	const fromHeaders = regionFromHeaders(event.request.headers);
	if (fromHeaders) return fromHeaders;

	const ip = clientIp(event);
	if (!ip) return null;
	return lookupIpRegion(ip);
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
