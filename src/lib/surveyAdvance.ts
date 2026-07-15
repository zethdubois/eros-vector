/** Shared delay so the selected answer is visible before the next step. */
export const ADVANCE_MS = 340;

export function afterSelect(fn: () => void, ms = ADVANCE_MS) {
	return window.setTimeout(fn, ms);
}
