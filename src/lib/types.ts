export type Axis = 'x' | 'y' | 'z';

export type LikertValue = 1 | 2 | 3 | 4 | 5;

/** Map of questionId → Likert 1–5 */
export type Answers = Record<string, LikertValue>;

export type Phase = 'intake' | 't0' | 't1' | 't2' | 't3' | 'results';

export type Question = {
	id: string;
	axis: Axis;
	text: string;
};

export type Coordinates = {
	x: number;
	y: number;
	z: number;
};

export type Routing = {
	t0: boolean;
	t1: boolean;
	t2: boolean;
	t3: boolean;
	finalForm: boolean;
};

export type Intake = {
	chronAge: number;
	awakeAge: number;
	sexAge: number;
};

export type Era = {
	id: string;
	name: string;
	scouting: Answers;
	bound: Answers;
	shadow: boolean;
};

export type DualModeAnswers = {
	scouting: Answers;
	bound: Answers;
	shadow: boolean;
};

export type SurveyState = {
	/** Session PRNG seed — locks question order across T0–T3 for this run. */
	questionSeed: number;
	intake: Intake | null;
	routing: Routing | null;
	eras: Era[];
	present: DualModeAnswers;
	aspiration: Answers;
	horizon: Answers | null;
	phase: Phase;
};
