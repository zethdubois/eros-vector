/** Shared content-table column defs (safe for client + server). */

export type TableColumnType = 'text' | 'number' | 'boolean' | 'enum';

export type TableColumn = {
	key: string;
	label: string;
	type: TableColumnType;
	editable: boolean;
	options?: string[];
};

export type TableCell = string | number | boolean;
export type TableRow = Record<string, TableCell>;

export const AXES_COLUMNS: TableColumn[] = [
	{ key: 'id', label: 'id', type: 'text', editable: false },
	{ key: 'label', label: 'label', type: 'text', editable: true },
	{ key: 'positive_pole', label: 'positive_pole', type: 'text', editable: true },
	{ key: 'negative_pole', label: 'negative_pole', type: 'text', editable: true },
	{ key: 'display_order', label: 'display_order', type: 'number', editable: true }
];

/** Inline editor columns — axis before bank; bank/axis/id are read-only on existing rows. */
export const QUESTIONS_COLUMNS: TableColumn[] = [
	{ key: 'id', label: 'id', type: 'text', editable: false },
	{
		key: 'axis_id',
		label: 'axis_id',
		type: 'enum',
		editable: false,
		options: ['y', 'x', 'z']
	},
	{
		key: 'bank',
		label: 'bank',
		type: 'enum',
		editable: false,
		options: ['quick_vibe', 'deep_dive']
	},
	{ key: 'text', label: 'text', type: 'text', editable: true },
	{ key: 'active', label: 'active', type: 'boolean', editable: true }
];

/** CSV keeps full DB shape including position. */
export const QUESTIONS_EXPORT_COLUMNS: TableColumn[] = [
	{ key: 'id', label: 'id', type: 'text', editable: false },
	{
		key: 'axis_id',
		label: 'axis_id',
		type: 'enum',
		editable: false,
		options: ['y', 'x', 'z']
	},
	{
		key: 'bank',
		label: 'bank',
		type: 'enum',
		editable: false,
		options: ['quick_vibe', 'deep_dive']
	},
	{ key: 'text', label: 'text', type: 'text', editable: true },
	{ key: 'position', label: 'position', type: 'number', editable: false },
	{ key: 'active', label: 'active', type: 'boolean', editable: true }
];

export function columnsForTable(table: 'survey_axes' | 'survey_questions'): TableColumn[] {
	return table === 'survey_axes' ? AXES_COLUMNS : QUESTIONS_COLUMNS;
}

export function exportColumnsForTable(table: 'survey_axes' | 'survey_questions'): TableColumn[] {
	return table === 'survey_axes' ? AXES_COLUMNS : QUESTIONS_EXPORT_COLUMNS;
}

/** Next stable question id + position for a bank/axis pair. */
export function nextQuestionIdentity(
	existing: { id: string; bank: string; axis_id: string; position: number }[],
	bank: 'quick_vibe' | 'deep_dive',
	axisId: string
): { id: string; position: number } {
	const siblings = existing.filter((row) => row.bank === bank && row.axis_id === axisId);
	let position = siblings.reduce((max, row) => Math.max(max, Number(row.position) || 0), 0) + 1;
	const used = new Set(existing.map((row) => row.id));

	const candidate = (n: number) => {
		if (bank === 'quick_vibe') return n === 1 ? `qv-${axisId}` : `qv-${axisId}${n}`;
		return `dd-${axisId}${n}`;
	};

	let id = candidate(position);
	while (used.has(id)) {
		position += 1;
		id = candidate(position);
	}
	return { id, position };
}
