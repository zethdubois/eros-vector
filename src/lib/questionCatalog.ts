import type { Question } from '$lib/types';

/** Canonical question banks — also used to seed Postgres and as a local fallback. */
export const FALLBACK_QUICK_VIBE: Question[] = [
	{
		id: 'qv-y',
		axis: 'y',
		text: 'I envision my ideal life having a central "home base" partner or anchor, rather than keeping my living and financial life entirely my own.'
	},
	{
		id: 'qv-x',
		axis: 'x',
		text: 'I want the freedom to pursue sexual variety and erotic energy with others, rather than keeping all sexual energy contained exclusively within one core bond.'
	},
	{
		id: 'qv-z',
		axis: 'z',
		text: 'I prefer my relationships to operate with explicitly negotiated rules and boundaries (even if the rule is strict exclusivity), rather than fluid, unspoken social vibes.'
	}
];

export const FALLBACK_DEEP_DIVE: Question[] = [
	{
		id: 'dd-y1',
		axis: 'y',
		text: 'I envision my ideal life having a central "home base" partner or anchor, rather than keeping my living and financial life entirely my own.'
	},
	{
		id: 'dd-y2',
		axis: 'y',
		text: 'I believe it is natural and ethical for one relationship to hold clear priority in my life decisions over others.'
	},
	{
		id: 'dd-y3',
		axis: 'y',
		text: 'I imagine wanting to deeply merge my logistics (finances, housing, family building) with a partner, rather than maintaining strict logistical independence.'
	},
	{
		id: 'dd-y4',
		axis: 'y',
		text: 'I envision my ideal relationship architecture having a central, prioritized partnership, with other connections playing more peripheral roles.'
	},
	{
		id: 'dd-y5',
		axis: 'y',
		text: 'I see the "couple" as the fundamental unit of my relational life, rather than the "individual."'
	},
	{
		id: 'dd-x1',
		axis: 'x',
		text: 'I want the freedom to pursue sexual variety and erotic energy with others, rather than keeping all sexual energy contained exclusively within one core bond.'
	},
	{
		id: 'dd-x2',
		axis: 'x',
		text: 'I view sexual play with others primarily as a recreational enhancement to life, rather than a path to building deeply intertwined emotional lives.'
	},
	{
		id: 'dd-x3',
		axis: 'x',
		text: 'I am drawn to the idea of group or "moresome" energy primarily for the physical/erotic thrill, rather than for the emotional intimacy of a chosen family.'
	},
	{
		id: 'dd-x4',
		axis: 'x',
		text: 'I believe relationships are best when they serve the purpose of mutual pleasure and play, rather than needing to serve the practical realities of life (co-parenting, shared resources).'
	},
	{
		id: 'dd-x5',
		axis: 'x',
		text: 'I imagine I would be more fulfilled by a wide variety of casual/playful sexual connections than by a few deeply emotionally integrated ones.'
	},
	{
		id: 'dd-z1',
		axis: 'z',
		text: 'I prefer to find and manage connections through intentional design (apps, explicit boundaries, scheduled quests), rather than letting them erupt organically from permissive social circles.'
	},
	{
		id: 'dd-z2',
		axis: 'z',
		text: 'I prefer to rely on explicitly negotiated rules and boundaries regarding outside interactions (even if the rule is strict exclusivity), rather than fluid, unspoken social vibes.'
	},
	{
		id: 'dd-z3',
		axis: 'z',
		text: 'I believe relational structures work best as a scheduled, defined activity, rather than something that spontaneously happens when the vibe is right.'
	},
	{
		id: 'dd-z4',
		axis: 'z',
		text: 'I prefer relationships to stay true to their original intent (e.g., a play partner stays a play partner; a monogamous bond stays monogamous), rather than letting them organically evolve far beyond their starting point.'
	},
	{
		id: 'dd-z5',
		axis: 'z',
		text: 'I am someone who designs my relationship structure from a blueprint, rather than letting it grow like a garden based on who we meet and what the situation requires.'
	}
];

export function fallbackQuestionBanks() {
	return {
		quickVibe: FALLBACK_QUICK_VIBE.map((q) => ({ ...q })),
		deepDive: FALLBACK_DEEP_DIVE.map((q) => ({ ...q }))
	};
}
