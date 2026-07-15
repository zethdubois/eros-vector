import type { Question } from './types';

/** Quick Vibe Check — used for T0 eras (1 per axis) */
export const quickVibeQuestions: Question[] = [
	{
		id: 'qv-y',
		axis: 'y',
		text: 'I envision my ideal life having a central "home base" partner or anchor, rather than keeping my living and financial life entirely my own.'
	},
	{
		id: 'qv-x',
		axis: 'x',
		text: 'My primary drive for exploring connections outside my core structure is the pursuit of sexual variety and erotic energy, rather than seeking deep, romantic emotional bonds.'
	},
	{
		id: 'qv-z',
		axis: 'z',
		text: 'I am someone who designs my relationship structure from a blueprint, rather than letting it grow like a garden based on who the people are and what the situation requires.'
	}
];

/**
 * Deep Dive Core Engine — used for T1, T2, T3.
 * All phrased so 5 = strongest pull to positive pole.
 */
export const deepDiveQuestions: Question[] = [
	// Y-Axis (Structure +Y vs Autonomy -Y)
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
	// X-Axis (Hedonism +X vs Emotional Depth -X)
	{
		id: 'dd-x1',
		axis: 'x',
		text: 'My primary drive for exploring connections outside my core structure is the pursuit of sexual variety and erotic energy, rather than seeking deep, romantic emotional bonds.'
	},
	{
		id: 'dd-x2',
		axis: 'x',
		text: 'I view outside sexual play primarily as a recreational activity and a fun enhancement to life, rather than a path to building deeply intertwined emotional lives.'
	},
	{
		id: 'dd-x3',
		axis: 'x',
		text: 'I am drawn to the idea of "moresome" or group energy primarily for the physical/erotic thrill, rather than for the emotional intimacy of a chosen family.'
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
	// Z-Axis (Intentional +Z vs Organic -Z)
	{
		id: 'dd-z1',
		axis: 'z',
		text: 'I prefer to find connections through intentional design (apps, lifestyle events, specific quests) rather than letting them erupt organically from permissive social circles.'
	},
	{
		id: 'dd-z2',
		axis: 'z',
		text: 'I prefer to rely on explicitly negotiated rules and boundaries before playing, rather than fluid, unspoken social vibes.'
	},
	{
		id: 'dd-z3',
		axis: 'z',
		text: 'I believe non-monogamy works best as a structured, scheduled activity, rather than something that spontaneously happens when the vibe is right.'
	},
	{
		id: 'dd-z4',
		axis: 'z',
		text: 'I prefer relationships to stay true to their original intent (e.g., a play partner stays a play partner), rather than letting them organically evolve far beyond their starting point.'
	},
	{
		id: 'dd-z5',
		axis: 'z',
		text: 'I am someone who designs my relationship structure from a blueprint, rather than letting it grow like a garden based on who the people are and what the situation requires.'
	}
];

export const LIKERT_LABELS: Record<number, string> = {
	1: 'Strongly Disagree',
	2: 'Disagree',
	3: 'Neutral',
	4: 'Agree',
	5: 'Strongly Agree'
};
