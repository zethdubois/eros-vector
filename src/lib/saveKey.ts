/** Prefix for exported save keys (Eros Vector v1). */
export const SAVE_KEY_PREFIX = 'ev1.';

export const SAVE_KEY_TOOLTIP =
	'Nothing is saved on our servers. Your key is private and holds your full survey progress — answers, phase, and all. Anyone with the key can read your data, so keep it safe.';

function toBase64Url(text: string): string {
	const bytes = new TextEncoder().encode(text);
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(encoded: string): string {
	const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
	const pad = normalized.length % 4;
	const padded = pad ? normalized + '='.repeat(4 - pad) : normalized;
	const binary = atob(padded);
	const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}

/** Encode JSON payload into a portable private key string. */
export function encodeSaveKeyPayload(json: string): string {
	return SAVE_KEY_PREFIX + toBase64Url(json);
}

/** Decode a save key to JSON payload, or null if invalid. */
export function decodeSaveKeyPayload(key: string): string | null {
	const trimmed = key.trim();
	if (!trimmed.startsWith(SAVE_KEY_PREFIX)) return null;
	try {
		return fromBase64Url(trimmed.slice(SAVE_KEY_PREFIX.length));
	} catch {
		return null;
	}
}
