/** Spec §4 — frame answers as Orientation/Desire, not current behavior. */
export const MODE_PROMPTS = {
	scouting:
		'Answer based on how you operate and what you seek when single/unbound.',
	bound:
		'Answer based on your ideal bond structure even if you are currently single.'
} as const;

/** One-line context for each time layer — shown under the T label. */
export const PHASE_BLURBS = {
	t0: 'Named chapters of your relational past — one era at a time.',
	t1: 'Where you are now in your relational life.',
	t2: 'The pair-bond structure you want to build toward.',
	t3: 'Where you imagine yourself long-term.',
	finalForm:
		'Your long-range relational architecture — aspiration and horizon together.'
} as const;

export const LIKERT_LABELS: Record<number, string> = {
	1: 'Strongly Disagree',
	2: 'Disagree',
	3: 'Neutral',
	4: 'Agree',
	5: 'Strongly Agree'
};
