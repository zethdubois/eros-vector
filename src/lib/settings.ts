/**
 * Build-time feature flags and settings.
 * Change these constants to toggle behaviour across the survey.
 */
export const SETTINGS = {
	/**
	 * When true, scouting mode questions are suppressed — all survey phases
	 * run in bound-only mode. The scouting result pass will score as zero
	 * (Schrödinger) until this is re-enabled and scouting questions are answered.
	 */
	scoutingDisabled: true,

	/**
	 * When true, age-based routing heuristics (sexAge threshold for past eras,
	 * chronAge >= 55 triggering finalForm) are disabled. All phases are shown
	 * to every respondent regardless of age inputs.
	 */
	sexAgeDisabled: true,
} as const;
