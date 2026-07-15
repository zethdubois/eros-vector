import { deepDiveQuestions, quickVibeQuestions } from './questions';
import type { Question } from './types';

/** Mulberry32 — deterministic PRNG from a 32-bit seed. */
export function mulberry32(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function newQuestionSeed(): number {
	if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
		const buf = new Uint32Array(1);
		crypto.getRandomValues(buf);
		return buf[0] >>> 0 || (Date.now() >>> 0);
	}
	return (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
}

/** Fisher–Yates shuffle with a seeded RNG (does not mutate input). */
export function shuffleWithSeed<T>(items: readonly T[], seed: number): T[] {
	const rng = mulberry32(seed);
	const arr = [...items];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		const tmp = arr[i];
		arr[i] = arr[j];
		arr[j] = tmp;
	}
	return arr;
}

/** Session order for Deep Dive (T1/T2/T3) — same sequence every T. */
export function orderedDeepDive(seed: number): Question[] {
	return shuffleWithSeed(deepDiveQuestions, seed);
}

/** Session order for Quick Vibe (T0) — derived from same seed, separate stream. */
export function orderedQuickVibe(seed: number): Question[] {
	return shuffleWithSeed(quickVibeQuestions, seed ^ 0x9e3779b9);
}
