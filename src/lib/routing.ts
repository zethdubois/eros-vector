import type { Intake, Routing } from './types';
import { SETTINGS } from './settings';

export function computeSexAge(chronAge: number, awakeAge: number): number {
	return chronAge - awakeAge;
}

export function computeRouting(chronAge: number, awakeAge: number): { intake: Intake; routing: Routing } {
	const sexAge = computeSexAge(chronAge, awakeAge);

	if (SETTINGS.sexAgeDisabled) {
		return {
			intake: { chronAge, awakeAge, sexAge },
			routing: { t0: true, t1: true, t2: true, t3: true, finalForm: false }
		};
	}

	const finalForm = chronAge >= 55;
	return {
		intake: { chronAge, awakeAge, sexAge },
		routing: {
			t0: sexAge > 3,
			t1: true,
			t2: true,
			t3: !finalForm,
			finalForm
		}
	};
}

export function validateIntake(
	chronAge: number | null,
	awakeAge: number | null
): string | null {
	if (chronAge === null || awakeAge === null || Number.isNaN(chronAge) || Number.isNaN(awakeAge)) {
		return 'Enter both current age and awake age.';
	}
	if (chronAge < 1 || awakeAge < 1) {
		return 'Ages must be positive.';
	}
	if (!Number.isInteger(chronAge) || !Number.isInteger(awakeAge)) {
		return 'Ages must be whole numbers.';
	}
	if (awakeAge > chronAge) {
		return 'Awake age cannot be greater than current age.';
	}
	return null;
}
