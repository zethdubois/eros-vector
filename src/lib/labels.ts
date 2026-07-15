import type { Axis, Coordinates } from './types';

const POLE_LABELS: Record<Axis, { positive: string; negative: string }> = {
	y: { positive: 'Anchored', negative: 'Solo' },
	x: { positive: 'Hedonism', negative: 'Team Player' },
	z: { positive: 'Designed', negative: 'Tribal' }
};

const AXIS_ORDER: Axis[] = ['y', 'x', 'z'];

/** Minimum |coordinate| to name a pole on the −2…+2 scale. */
const POLE_THRESHOLD = 0.35;

/** Plain-language profile name from axis coordinates (spec §7 diagnostic readout). */
export function coordinateLabel(coords: Coordinates): string {
	const parts: string[] = [];

	for (const axis of AXIS_ORDER) {
		const value = coords[axis];
		if (value > POLE_THRESHOLD) parts.push(POLE_LABELS[axis].positive);
		else if (value < -POLE_THRESHOLD) parts.push(POLE_LABELS[axis].negative);
	}

	return parts.length > 0 ? parts.join(' ') : 'Centered';
}
