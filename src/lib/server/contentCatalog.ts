import { asc, eq } from 'drizzle-orm';
import { columnsForTable, type TableRow } from '$lib/contentTable';
import { fallbackQuestionBanks } from '$lib/questionCatalog';
import { getDb } from './db';
import { surveyAxes, surveyQuestions } from './db/schema';

export { columnsForTable, type TableCell, type TableColumn, type TableRow } from '$lib/contentTable';

export const CONTENT_TABLES = ['survey_axes', 'survey_questions'] as const;
export type ContentTable = (typeof CONTENT_TABLES)[number];

export type ContentNavItem = {
	slug: ContentTable;
	label: string;
};

export const CONTENT_NAV: ContentNavItem[] = [
	{ slug: 'survey_axes', label: 'survey_axes' },
	{ slug: 'survey_questions', label: 'survey_questions' }
];

export function isContentTable(value: string): value is ContentTable {
	return (CONTENT_TABLES as readonly string[]).includes(value);
}

export type AxisContent = {
	axis: string;
	label: string;
	positivePole: string;
	negativePole: string;
	displayOrder: number;
};

export type QuestionGroup = {
	bank: 'quick_vibe' | 'deep_dive';
	bankLabel: string;
	hint: string;
	axes: {
		axis: string;
		label: string;
		questions: { id: string; text: string }[];
	}[];
};

const AXIS_ORDER = ['y', 'x', 'z'] as const;

const BANK_META = {
	quick_vibe: {
		bankLabel: 'Quick Vibe',
		hint: 'Past eras (T0) — one item per axis.'
	},
	deep_dive: {
		bankLabel: 'Deep Dive',
		hint: 'Present, Aspiration, and Horizon — five items per axis.'
	}
} as const;

const FALLBACK_AXES: AxisContent[] = [
	{
		axis: 'y',
		label: 'Architecture',
		positivePole: 'Interdependent',
		negativePole: 'Autonomous',
		displayOrder: 1
	},
	{
		axis: 'x',
		label: 'Drive',
		positivePole: 'Erotic',
		negativePole: 'Emotional',
		displayOrder: 2
	},
	{
		axis: 'z',
		label: 'Method',
		positivePole: 'Directed',
		negativePole: 'Organic',
		displayOrder: 3
	}
];

function axisHeading(axis: string, label: string, positive: string, negative: string): string {
	const letter = axis.toUpperCase();
	return `Axis ${letter} — ${label} (${positive} ↔ ${negative})`;
}

async function loadAxesFromDb(): Promise<AxisContent[]> {
	const db = getDb();
	const rows = await db
		.select({
			axis: surveyAxes.id,
			label: surveyAxes.label,
			positivePole: surveyAxes.positivePole,
			negativePole: surveyAxes.negativePole,
			displayOrder: surveyAxes.displayOrder
		})
		.from(surveyAxes)
		.orderBy(asc(surveyAxes.displayOrder));
	if (rows.length === 0) throw new Error('No survey_axes rows');
	return rows;
}

async function loadQuestionGroupsFromDb(axes: AxisContent[]): Promise<QuestionGroup[]> {
	const db = getDb();
	const rows = await db
		.select({
			id: surveyQuestions.id,
			bank: surveyQuestions.bank,
			axisId: surveyQuestions.axisId,
			text: surveyQuestions.text,
			position: surveyQuestions.position
		})
		.from(surveyQuestions)
		.where(eq(surveyQuestions.active, true))
		.orderBy(asc(surveyQuestions.bank), asc(surveyQuestions.position));

	const axisMeta = new Map(axes.map((a) => [a.axis, a]));

	return (['quick_vibe', 'deep_dive'] as const).map((bank) => {
		const bankRows = rows.filter((r) => r.bank === bank);
		const meta = BANK_META[bank];
		return {
			bank,
			bankLabel: meta.bankLabel,
			hint: meta.hint,
			axes: AXIS_ORDER.map((axis) => {
				const a = axisMeta.get(axis);
				return {
					axis,
					label: a
						? axisHeading(axis, a.label, a.positivePole, a.negativePole)
						: axis.toUpperCase(),
					questions: bankRows
						.filter((r) => r.axisId === axis)
						.map((r) => ({ id: r.id, text: r.text }))
				};
			}).filter((g) => g.questions.length > 0)
		};
	});
}

function fallbackQuestionGroups(axes: AxisContent[]): QuestionGroup[] {
	const banks = fallbackQuestionBanks();
	const axisMeta = new Map(axes.map((a) => [a.axis, a]));

	return [
		{
			bank: 'quick_vibe',
			...BANK_META.quick_vibe,
			axes: AXIS_ORDER.map((axis) => {
				const a = axisMeta.get(axis);
				return {
					axis,
					label: a
						? axisHeading(axis, a.label, a.positivePole, a.negativePole)
						: axis.toUpperCase(),
					questions: banks.quickVibe
						.filter((q) => q.axis === axis)
						.map((q) => ({ id: q.id, text: q.text }))
				};
			}).filter((g) => g.questions.length > 0)
		},
		{
			bank: 'deep_dive',
			...BANK_META.deep_dive,
			axes: AXIS_ORDER.map((axis) => {
				const a = axisMeta.get(axis);
				return {
					axis,
					label: a
						? axisHeading(axis, a.label, a.positivePole, a.negativePole)
						: axis.toUpperCase(),
					questions: banks.deepDive
						.filter((q) => q.axis === axis)
						.map((q) => ({ id: q.id, text: q.text }))
				};
			}).filter((g) => g.questions.length > 0)
		}
	];
}

async function loadAxesRowsFromDb(): Promise<TableRow[]> {
	const db = getDb();
	const rows = await db
		.select({
			id: surveyAxes.id,
			label: surveyAxes.label,
			positive_pole: surveyAxes.positivePole,
			negative_pole: surveyAxes.negativePole,
			display_order: surveyAxes.displayOrder
		})
		.from(surveyAxes)
		.orderBy(asc(surveyAxes.displayOrder));
	if (rows.length === 0) throw new Error('No survey_axes rows');
	return rows;
}

async function loadQuestionRowsFromDb(): Promise<TableRow[]> {
	const db = getDb();
	return db
		.select({
			id: surveyQuestions.id,
			bank: surveyQuestions.bank,
			axis_id: surveyQuestions.axisId,
			text: surveyQuestions.text,
			position: surveyQuestions.position,
			active: surveyQuestions.active
		})
		.from(surveyQuestions)
		.orderBy(
			asc(surveyQuestions.bank),
			asc(surveyQuestions.axisId),
			asc(surveyQuestions.position)
		);
}

function fallbackAxisRows(): TableRow[] {
	return FALLBACK_AXES.map((a) => ({
		id: a.axis,
		label: a.label,
		positive_pole: a.positivePole,
		negative_pole: a.negativePole,
		display_order: a.displayOrder
	}));
}

function fallbackQuestionRows(): TableRow[] {
	const banks = fallbackQuestionBanks();
	const mapBank = (
		bank: 'quick_vibe' | 'deep_dive',
		items: { id: string; axis: string; text: string }[]
	): TableRow[] => {
		const byAxis = new Map<string, number>();
		return items.map((q) => {
			const next = (byAxis.get(q.axis) ?? 0) + 1;
			byAxis.set(q.axis, next);
			return {
				id: q.id,
				bank,
				axis_id: q.axis,
				text: q.text,
				position: next,
				active: true
			};
		});
	};
	return [
		...mapBank('quick_vibe', banks.quickVibe),
		...mapBank('deep_dive', banks.deepDive)
	];
}

export async function loadContentCatalog(): Promise<{
	axes: AxisContent[];
	questionGroups: QuestionGroup[];
	axisRows: TableRow[];
	questionRows: TableRow[];
	fromDb: boolean;
}> {
	try {
		const [axes, axisRows, questionRows] = await Promise.all([
			loadAxesFromDb(),
			loadAxesRowsFromDb(),
			loadQuestionRowsFromDb()
		]);
		const questionGroups = await loadQuestionGroupsFromDb(axes);
		return { axes, questionGroups, axisRows, questionRows, fromDb: true };
	} catch (err) {
		console.warn('Content catalog DB unavailable — using fallback', err);
		const axes = FALLBACK_AXES;
		return {
			axes,
			questionGroups: fallbackQuestionGroups(axes),
			axisRows: fallbackAxisRows(),
			questionRows: fallbackQuestionRows(),
			fromDb: false
		};
	}
}
