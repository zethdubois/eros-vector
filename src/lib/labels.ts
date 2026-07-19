import type { Coordinates } from './types';

export type OctantSign = '+' | '-';

export type Archetype = {
	id: string;
	name: string;
	/** Four-pole descriptor, e.g. "Autonomous · Recreational · Contained · Organic" */
	tagline: string;
	description: string;
	/** One-line character summary from archetypes.md */
	signature: string;
	/** Signs in W / X / Y / Z order (axes.md locked key). */
	signs: { w: OctantSign; x: OctantSign; y: OctantSign; z: OctantSign };
};

/**
 * All 16 orthants from docs/wiki/archetypes.md (v2).
 *
 * Axis key (W / X / Y / Z):
 *   W  Architecture  + Interdependent  − Autonomous
 *   X  Drive         + Recreational    − Romantic
 *   Y  Permeability  + Contained       − Permeable
 *   Z  Method        + Directed        − Organic
 */
export const ARCHETYPES: Archetype[] = [
	// ── Interdependent + Recreational ────────────────────────────────────────

	{
		id: 'structured-play-unit',
		name: 'Structured Play Unit',
		tagline: 'Interdependent · Recreational · Contained · Directed',
		description:
			'You organize life around a merged, interdependent relational core and deliberately seek additional connections for recreational erotic play. Because your method is directed, you proactively use apps, clubs, schedules, or explicit agreements to create that play. Your system remains highly contained: those connections stay in their lane, compartmentalized from the core\'s daily life, social fabric, and logistics. Adventure is designed, but the walls around the relational core stay solid.',
		signature: 'A protected home base with an intentional playbook.',
		signs: { w: '+', x: '+', y: '+', z: '+' }
	},
	{
		id: 'spontaneous-play-unit',
		name: 'Spontaneous Play Unit',
		tagline: 'Interdependent · Recreational · Contained · Organic',
		description:
			'Your life is built around a merged relational core, and you seek additional connection primarily for recreational erotic play. Rather than scheduling every encounter or relying on apps, your method is organic — play emerges from social vibes, friendship circles, travel, or circumstance. Despite that fluid approach to finding play, your boundaries remain contained. Additional connections stay compartmentalized and do not integrate into or reshape the core\'s logistics or emotional life.',
		signature: 'A protected home base with play that happens when the vibe is right.',
		signs: { w: '+', x: '+', y: '+', z: '-' }
	},
	{
		id: 'integrated-play-partners',
		name: 'Integrated Play Partners',
		tagline: 'Interdependent · Recreational · Permeable · Directed',
		description:
			'Your life is anchored by a merged, interdependent relational core, and you deliberately seek additional connections for recreational erotic play. You use a directed method — apps, events, or explicit networking — to find that play. Your system is highly permeable: play partners are not siloed; they may be brought into the social fabric, blending friendship and eroticism within the wider relational system without requiring every connection to become romantic.',
		signature: 'An anchored life with a deliberately integrated play network.',
		signs: { w: '+', x: '+', y: '-', z: '+' }
	},
	{
		id: 'tribal-erotic',
		name: 'Tribal Erotic',
		tagline: 'Interdependent · Recreational · Permeable · Organic',
		description:
			'You build life around a merged relational core while thriving in a permissive erotic ecosystem. Your drive is recreational — sexual variety and play — and your method is organic: energy emerges spontaneously from the vibe of the tribe. Your boundaries are highly permeable; friends and lovers blur as connections freely cross-pollinate into the social fabric, creating an integrated, flowing web of play around the home base.',
		signature: 'An anchored core inside an organically erotic tribe.',
		signs: { w: '+', x: '+', y: '-', z: '-' }
	},

	// ── Interdependent + Romantic ─────────────────────────────────────────────

	{
		id: 'closed-builder',
		name: 'Closed Builder',
		tagline: 'Interdependent · Romantic · Contained · Directed',
		description:
			'You intentionally build life around a merged, interdependent relational core driven by profound romantic and emotional depth. Your method is directed: explicit agreements, defined roles, and architecture designed from a blueprint. Your system is strictly contained; the intimacy of the core is protected from integration by additional people. Whether that core is a dyad, a closed triad, a polyfidelitous group, or another bounded configuration, the bond is deliberately constructed and highly protected.',
		signature: 'A carefully designed, emotionally deep, closed relational core.',
		signs: { w: '+', x: '-', y: '+', z: '+' }
	},
	{
		id: 'closed-nest',
		name: 'Closed Nest',
		tagline: 'Interdependent · Romantic · Contained · Organic',
		description:
			'Your life is organized around a deeply merged, interdependent relational core motivated by romantic attachment. Rather than designing it from a blueprint, your method is organic — the bond grew naturally into a secure, intertwined life. Your boundaries are strictly contained; the intimacy of the nest stays walled off, keeping additional connections from integrating into or reshaping the core. You did not necessarily plan the walls; they grew around the garden.',
		signature: 'An emotionally rich, closed home that grew like a garden.',
		signs: { w: '+', x: '-', y: '+', z: '-' }
	},
	{
		id: 'poly-architect',
		name: 'Poly Architect',
		tagline: 'Interdependent · Romantic · Permeable · Directed',
		description:
			'You intentionally build life around a merged relational core while seeking deep romantic and emotional integration with multiple people. Your method is highly directed: explicit negotiation, clear agreements, and deliberate design. Your system is permeable; additional romantic connections are brought fully into the light, integrated into life, and treated as chosen family. You architect an interconnected network from a careful blueprint.',
		signature: 'An intentionally designed, emotionally integrated polycule.',
		signs: { w: '+', x: '-', y: '-', z: '+' }
	},
	{
		id: 'chosen-family',
		name: 'Chosen Family',
		tagline: 'Interdependent · Romantic · Permeable · Organic',
		description:
			'Your life is organized around an interdependent relational core driven by profound romantic attachment, but you let the wider relational system grow without a rigid blueprint. Your boundaries are highly permeable; connections naturally evolve and integrate. A friend may become a lover, a lover a housemate, a partner a co-parent. You grow an organically intertwined, permeable chosen family through love and practical need.',
		signature: 'An organically grown, intertwined relational family.',
		signs: { w: '+', x: '-', y: '-', z: '-' }
	},

	// ── Autonomous + Recreational ─────────────────────────────────────────────

	{
		id: 'solo-player',
		name: 'Solo Player',
		tagline: 'Autonomous · Recreational · Contained · Directed',
		description:
			'You are sovereign. You do not organize life around a merged relational core, preferring your own logistics and independence. You have a strong drive for recreational erotic play and find it through directed outreach — apps, events, or clear casual arrangements. Your system is strictly contained: sexual connections stay siloed from one another and from the rest of your life rather than becoming intertwined or integrated.',
		signature: 'Independent, proactive, and cleanly compartmentalized.',
		signs: { w: '-', x: '+', y: '+', z: '+' }
	},
	{
		id: 'guarded-free-agent',
		name: 'Guarded Free Agent',
		tagline: 'Autonomous · Recreational · Contained · Organic',
		description:
			'You are fiercely independent, organizing life around yourself rather than a relational core. You seek recreational erotic play, but prefer it to arise organically from the energy of the moment rather than scheduled outreach. Even when play is spontaneous, your boundaries stay highly contained. Connections remain compartmentalized and do not cross into your wider social fabric or become entangled in your life.',
		signature: 'Spontaneous play with a guarded personal world.',
		signs: { w: '-', x: '+', y: '+', z: '-' }
	},
	{
		id: 'open-explorer',
		name: 'Open Explorer',
		tagline: 'Autonomous · Recreational · Permeable · Directed',
		description:
			'You are your own primary, maintaining sovereign control over life and logistics. You have a strong drive for recreational erotic play and proactively direct your outreach through apps, communities, or intentional invitation. Your system is permeable: casual partners may become part of your wider social life. You deliberately weave a web of friends and lovers, enjoying erotic variety without organizing around a merged relational core.',
		signature: 'Sovereign, exploratory, and intentionally networked.',
		signs: { w: '-', x: '+', y: '-', z: '+' }
	},
	{
		id: 'free-agent',
		name: 'Free Agent',
		tagline: 'Autonomous · Recreational · Permeable · Organic',
		description:
			'You are fiercely independent and thrive on recreational erotic play. Your method is organic — you move through permissive social spaces and let casual connections arise when the vibe is right. Your boundaries are highly permeable; lovers are not siloed. Connections organically become friends and community members, weaving a fluid erotic ecosystem around your autonomous life.',
		signature: 'Independent flow through a porous social-erotic ecosystem.',
		signs: { w: '-', x: '+', y: '-', z: '-' }
	},

	// ── Autonomous + Romantic ─────────────────────────────────────────────────

	{
		id: 'focused-romantic',
		name: 'Focused Romantic',
		tagline: 'Autonomous · Romantic · Contained · Directed',
		description:
			'You maintain autonomy and individual logistics while deliberately seeking profound, exclusive romantic connection. Your method is directed — purposeful dating, clear pursuit, and focused bonding. When you bond, your system becomes highly contained and closed to additional romantic or sexual integration. Serial monogamy is one common landmark in this orthant, but so is any intentionally pursued, deeply romantic, bounded connection that preserves the individual as life\'s organizing center.',
		signature: 'Sovereign life architecture with intentionally focused romance.',
		signs: { w: '-', x: '-', y: '+', z: '+' }
	},
	{
		id: 'lone-wolf-romantic',
		name: 'Lone Wolf Romantic',
		tagline: 'Autonomous · Romantic · Contained · Organic',
		description:
			'You are sovereign, organizing life around yourself, yet you crave deep romantic and emotional intimacy. Your method is organic — exclusive bonds arise through circumstance and connection rather than proactive searching. When you bond, it is intense and contained, walled off from additional integration. You form profound closed romantic attachments on your own terms, letting them evolve authentically while preserving independence.',
		signature: 'Deep, organic romance around an independent life.',
		signs: { w: '-', x: '-', y: '+', z: '-' }
	},
	{
		id: 'solo-polyamorist',
		name: 'Solo Polyamorist',
		tagline: 'Autonomous · Romantic · Permeable · Directed',
		description:
			'You are sovereign — refusing to merge logistics or organize around a relational core — yet you cultivate deep romantic emotional connections. You build them deliberately, using clear negotiation so attachment can be profound without logistical entanglement. Your system is permeable: partners may be integrated into your life and brought into the light, while you remain the architect of your own independence.',
		signature: 'Intentionally integrated love without a merged home base.',
		signs: { w: '-', x: '-', y: '-', z: '+' }
	},
	{
		id: 'relationship-anarchist',
		name: 'Relationship Anarchist',
		tagline: 'Autonomous · Romantic · Permeable · Organic',
		description:
			'You reject blueprints. You do not organize life around a relational core, nor do you impose a fixed ranking on connections. You let bonds — romantic, platonic, sexual, practical — grow organically into what they are meant to be, driven by emotional resonance and mutual care. Your boundaries are permeable; the network is a fluid web of belonging that evolves with the people and the moment, without a predetermined hierarchy.',
		signature: 'An organically evolving web of deep connection and autonomy.',
		signs: { w: '-', x: '-', y: '-', z: '-' }
	}
];

function axisSign(value: number): OctantSign {
	return value >= 0 ? '+' : '-';
}

/** Resolve coordinates to one of the 16 Eros Vector orthant archetypes (V2, WXYZ). */
export function resolveArchetype(coords: Coordinates): Archetype {
	const signs = {
		w: axisSign(coords.w),
		x: axisSign(coords.x),
		y: axisSign(coords.y),
		z: axisSign(coords.z)
	};
	const match = ARCHETYPES.find(
		(a) =>
			a.signs.w === signs.w &&
			a.signs.x === signs.x &&
			a.signs.y === signs.y &&
			a.signs.z === signs.z
	);
	// All 16 orthants are covered; fallback is a guard against future type drift.
	return match ?? ARCHETYPES[0];
}

/** Display name for a coordinate set (archetype title). */
export function coordinateLabel(coords: Coordinates): string {
	return resolveArchetype(coords).name;
}
