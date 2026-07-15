import type { Coordinates } from './types';

export type OctantSign = '+' | '-';

export type Archetype = {
	id: string;
	name: string;
	tagline: string;
	description: string;
	signs: { y: OctantSign; x: OctantSign; z: OctantSign };
};

/** Spec octants from docs/archetypes.md (note: Anchor Architect is +Y −X +Z). */
export const ARCHETYPES: Archetype[] = [
	{
		id: 'anchored-play-couple',
		name: 'The Anchored Play Couple',
		tagline: 'Structure + Eroticism + Intentional',
		description:
			'You are fundamentally a couple-centric person who views non-monogamy as a recreational team sport. Your anchor relationship is your absolute priority and provides your core security, but you actively seek out sexual variety and erotic energy to augment that bond. You prefer to design your play intentionally—using lifestyle apps, seeking out specific scenarios, or attending clubs together. Your architecture has a clear blueprint, and play is a scheduled, exciting addition to your structured life.',
		signs: { y: '+', x: '+', z: '+' }
	},
	{
		id: 'tribal-erotic',
		name: 'The Tribal Erotic',
		tagline: 'Structure + Eroticism + Organic',
		description:
			'You have a deep, prioritized "home base" anchor, but you thrive on sexual variety and playful energy that erupts naturally from your social ecosystem. You don\'t want to hunt for play on apps or schedule it like a meeting; you want to immerse yourself in a permissive, non-judgmental tribe where flirtation and group energy can spontaneously combust. Your anchor keeps you grounded, but the organic flow of the room dictates the play.',
		signs: { y: '+', x: '+', z: '-' }
	},
	{
		id: 'anchor-architect',
		name: 'The Anchor Architect',
		tagline: 'Structure + Emotional Depth + Intentional',
		description:
			'You are a builder. You want a deeply merged, prioritized anchor partnership, and you are open to extending that deep emotional intimacy to others—but only by design. You believe in explicit negotiation, clear boundaries, and intentional relationship architecture. Whether it\'s a planned triad or a highly structured hierarchical polyamory, you leave nothing to chance. You value profound emotional integration over casual erotic thrills, and you build your polycule from a careful blueprint.',
		signs: { y: '+', x: '-', z: '+' }
	},
	{
		id: 'pragmatic-chosen-family',
		name: 'The Pragmatic Chosen Family',
		tagline: 'Structure + Emotional Depth + Organic',
		description:
			'You are driven by the desire for deep, intertwined emotional bonds, but you don\'t force them into a pre-existing rulebook. You have an anchor, but you are open to relationships evolving far beyond their original intent—a play partner becomes a co-parent, a lover becomes a roommate. You let your connections grow like a garden based on practical needs and deep affection. Your relational life is an organically evolved, intertwined "chosen family" that supports each other through the realities of life.',
		signs: { y: '+', x: '-', z: '-' }
	},
	{
		id: 'solo-player',
		name: 'The Solo Player',
		tagline: 'Autonomy + Eroticism + Intentional',
		description:
			'You are your own primary. You have no desire to merge your life or logistics with a partner, but you have a high erotic drive for sexual variety and play. You are highly intentional about how you get your needs met—using apps, going to specific events, or setting up clear, casual arrangements. You want the fun and the thrill without the emotional heavy lifting or the logistical entanglement of a merged life.',
		signs: { y: '-', x: '+', z: '+' }
	},
	{
		id: 'free-agent',
		name: 'The Free Agent',
		tagline: 'Autonomy + Eroticism + Organic',
		description:
			'You are fiercely independent and deeply drawn to sexual play, but you refuse to schedule or structure your erotic life. You thrive in permissive social circles where casual, spontaneous connections simply erupt when the vibe is right. You don\'t want to manage a roster or negotiate a blueprint; you want to flow through social spaces, enjoying the physical and erotic energy of the moment without any logistical strings attached.',
		signs: { y: '-', x: '+', z: '-' }
	},
	{
		id: 'solo-polyamorist',
		name: 'The Solo Polyamorist',
		tagline: 'Autonomy + Emotional Depth + Intentional',
		description:
			'You crave deep, romantic emotional intimacy, but you refuse to sacrifice your autonomy or merge your life logistics. You want profound, emotionally integrated connections, but you build them intentionally. You are highly communicative, negotiate boundaries clearly, and design your relationships so that everyone gets deep emotional support without ever entangling finances, housing, or primary status. You are the CEO of your own life, with deeply loved partners as independent board members.',
		signs: { y: '-', x: '-', z: '+' }
	},
	{
		id: 'relationship-anarchist',
		name: 'The Relationship Anarchist',
		tagline: 'Autonomy + Emotional Depth + Organic',
		description:
			'You reject all blueprints. You do not rank your connections (romantic over platonic), you do not merge your logistics, and you do not follow societal scripts. You let every connection grow organically into whatever it is meant to be, driven by deep emotional resonance and practical need, without ever forcing it into a box. Your network is a fluid, unstructured web of profound care and mutual aid, constantly evolving based on the people and the moment.',
		signs: { y: '-', x: '-', z: '-' }
	}
];

function axisSign(value: number): OctantSign {
	return value >= 0 ? '+' : '-';
}

/** Resolve coordinates to one of the 8 Eros Vector octant archetypes. */
export function resolveArchetype(coords: Coordinates): Archetype {
	const signs = {
		y: axisSign(coords.y),
		x: axisSign(coords.x),
		z: axisSign(coords.z)
	};
	const match = ARCHETYPES.find(
		(a) => a.signs.y === signs.y && a.signs.x === signs.x && a.signs.z === signs.z
	);
	return match ?? ARCHETYPES[0];
}

/** Display name for a coordinate set (archetype title). */
export function coordinateLabel(coords: Coordinates): string {
	return resolveArchetype(coords).name;
}
