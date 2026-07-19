import { error, fail } from '@sveltejs/kit';
import { eq, notInArray, sql } from 'drizzle-orm';
import { parseCsv } from '$lib/csv';
import { exportColumnsForTable, nextQuestionIdentity } from '$lib/contentTable';
import { hasAtLeast } from '$lib/server/access';
import {
	columnsForTable,
	isContentTable,
	loadContentCatalog,
	type ContentTable,
	type TableColumn
} from '$lib/server/contentCatalog';
import { getDb } from '$lib/server/db';
import { surveyAxes, surveyQuestions } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

function editableKeys(columns: TableColumn[]): Set<string> {
	return new Set(columns.filter((c) => c.editable).map((c) => c.key));
}

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!isContentTable(params.table)) {
		error(404, 'Unknown content table');
	}

	const catalog = await loadContentCatalog();
	const columns = columnsForTable(params.table);
	const exportColumns = exportColumnsForTable(params.table);
	const rows =
		params.table === 'survey_axes' ? catalog.axisRows : catalog.questionRows;

	return {
		table: params.table,
		axes: catalog.axes,
		questionGroups: catalog.questionGroups,
		columns,
		exportColumns,
		rows,
		fromDb: catalog.fromDb,
		canEdit: locals.accessRole === 'developer'
	};
};

function parseCellValue(
	column: TableColumn,
	raw: string
): { ok: true; value: string | number | boolean } | { ok: false; error: string } {
	const trimmed = raw.trim();

	if (column.type === 'boolean') {
		if (trimmed === 'true' || trimmed === '1') return { ok: true, value: true };
		if (trimmed === 'false' || trimmed === '0') return { ok: true, value: false };
		return { ok: false, error: 'Value must be true or false.' };
	}

	if (column.type === 'number') {
		if (!/^-?\d+$/.test(trimmed)) return { ok: false, error: 'Value must be an integer.' };
		const n = Number(trimmed);
		if (column.key === 'position' && n < 1) {
			return { ok: false, error: 'Position must be >= 1.' };
		}
		if (column.key === 'display_order' && n < 1) {
			return { ok: false, error: 'Display order must be >= 1.' };
		}
		return { ok: true, value: n };
	}

	if (column.type === 'enum') {
		if (!column.options?.includes(trimmed)) {
			return {
				ok: false,
				error: `Value must be one of: ${column.options?.join(', ')}.`
			};
		}
		return { ok: true, value: trimmed };
	}

	if (!trimmed) return { ok: false, error: 'Value cannot be empty.' };
	if (column.key === 'text' && trimmed.length > 2000) {
		return { ok: false, error: 'Text is too long.' };
	}
	if (trimmed.length > 500 && column.key !== 'text') {
		return { ok: false, error: 'Value is too long.' };
	}
	return { ok: true, value: trimmed };
}

type AxisImportRow = {
	id: string;
	label: string;
	positivePole: string;
	negativePole: string;
	displayOrder: number;
};

type QuestionImportRow = {
	id: string;
	bank: 'quick_vibe' | 'deep_dive';
	axisId: string;
	text: string;
	position: number;
	active: boolean;
};

function parseInteger(raw: string, label: string, line: number): number {
	if (!/^\d+$/.test(raw.trim())) {
		throw new Error(`Line ${line}: ${label} must be a positive integer.`);
	}
	const value = Number(raw);
	if (value < 1) throw new Error(`Line ${line}: ${label} must be at least 1.`);
	return value;
}

function parseBoolean(raw: string, line: number): boolean {
	const value = raw.trim().toLowerCase();
	if (value === 'true' || value === '1') return true;
	if (value === 'false' || value === '0') return false;
	throw new Error(`Line ${line}: active must be true or false.`);
}

function csvRecords(csv: string, expectedHeaders: string[]): Record<string, string>[] {
	const parsed = parseCsv(csv);
	if (parsed.length < 2) throw new Error('CSV must contain a header and at least one data row.');

	const headers = parsed[0].map((header, index) =>
		index === 0 ? header.replace(/^\uFEFF/, '').trim() : header.trim()
	);
	const missing = expectedHeaders.filter((header) => !headers.includes(header));
	const extra = headers.filter((header) => !expectedHeaders.includes(header));
	if (missing.length || extra.length || headers.length !== expectedHeaders.length) {
		const details = [
			missing.length ? `missing: ${missing.join(', ')}` : '',
			extra.length ? `unexpected: ${extra.join(', ')}` : ''
		]
			.filter(Boolean)
			.join('; ');
		throw new Error(`CSV columns do not match this table${details ? ` (${details})` : ''}.`);
	}

	return parsed.slice(1).map((values, rowIndex) => {
		const line = rowIndex + 2;
		if (values.length !== headers.length) {
			throw new Error(`Line ${line}: expected ${headers.length} columns, found ${values.length}.`);
		}
		return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
	});
}

function required(value: string, field: string, line: number, max = 500): string {
	const trimmed = value.trim();
	if (!trimmed) throw new Error(`Line ${line}: ${field} cannot be empty.`);
	if (trimmed.length > max) throw new Error(`Line ${line}: ${field} is too long.`);
	return trimmed;
}

function parseAxisImport(csv: string): AxisImportRow[] {
	const records = csvRecords(csv, [
		'id',
		'label',
		'positive_pole',
		'negative_pole',
		'display_order'
	]);
	const ids = new Set<string>();
	const orders = new Set<number>();
	return records.map((record, index) => {
		const line = index + 2;
		const id = required(record.id, 'id', line);
		const displayOrder = parseInteger(record.display_order, 'display_order', line);
		if (ids.has(id)) throw new Error(`Line ${line}: duplicate id "${id}".`);
		if (orders.has(displayOrder)) {
			throw new Error(`Line ${line}: duplicate display_order ${displayOrder}.`);
		}
		ids.add(id);
		orders.add(displayOrder);
		return {
			id,
			label: required(record.label, 'label', line),
			positivePole: required(record.positive_pole, 'positive_pole', line),
			negativePole: required(record.negative_pole, 'negative_pole', line),
			displayOrder
		};
	});
}

function parseQuestionImport(csv: string): QuestionImportRow[] {
	const records = csvRecords(csv, ['id', 'bank', 'axis_id', 'text', 'position', 'active']);
	const ids = new Set<string>();
	const positions = new Set<string>();
	return records.map((record, index) => {
		const line = index + 2;
		const id = required(record.id, 'id', line);
		const bank = required(record.bank, 'bank', line);
		if (bank !== 'quick_vibe' && bank !== 'deep_dive') {
			throw new Error(`Line ${line}: bank must be quick_vibe or deep_dive.`);
		}
		const axisId = required(record.axis_id, 'axis_id', line);
		const position = parseInteger(record.position, 'position', line);
		const positionKey = `${bank}:${axisId}:${position}`;
		if (ids.has(id)) throw new Error(`Line ${line}: duplicate id "${id}".`);
		if (positions.has(positionKey)) {
			throw new Error(`Line ${line}: duplicate position ${position} for ${bank}/${axisId}.`);
		}
		ids.add(id);
		positions.add(positionKey);
		return {
			id,
			bank,
			axisId,
			text: required(record.text, 'text', line, 2000),
			position,
			active: parseBoolean(record.active, line)
		};
	});
}

export const actions: Actions = {
	updateQuestion: async ({ request, locals }) => {
		if (!hasAtLeast(locals.accessRole, 'developer')) {
			return fail(403, { ok: false as const, error: 'Developer access required.', questionId: '' });
		}

		const form = await request.formData();
		const questionId = String(form.get('questionId') ?? '').trim();
		const text = String(form.get('text') ?? '').trim();

		if (!questionId) {
			return fail(400, { ok: false as const, error: 'Missing question id.', questionId });
		}
		if (!text) {
			return fail(400, {
				ok: false as const,
				error: 'Question text cannot be empty.',
				questionId
			});
		}
		if (text.length > 2000) {
			return fail(400, { ok: false as const, error: 'Question text is too long.', questionId });
		}

		try {
			const db = getDb();
			const [updated] = await db
				.update(surveyQuestions)
				.set({ text })
				.where(eq(surveyQuestions.id, questionId))
				.returning({ id: surveyQuestions.id });

			if (!updated) {
				return fail(404, { ok: false as const, error: 'Question not found.', questionId });
			}

			return { ok: true as const, questionId, text };
		} catch (err) {
			console.error('updateQuestion failed', err);
			return fail(503, {
				ok: false as const,
				error: 'Could not save — check database connectivity.',
				questionId
			});
		}
	},

	updateCell: async ({ request, locals, params }) => {
		if (!hasAtLeast(locals.accessRole, 'developer')) {
			return fail(403, {
				ok: false as const,
				error: 'Developer access required.',
				rowId: '',
				field: ''
			});
		}
		if (!isContentTable(params.table)) {
			return fail(404, { ok: false as const, error: 'Unknown table.', rowId: '', field: '' });
		}

		const table = params.table as ContentTable;
		const form = await request.formData();
		const rowId = String(form.get('rowId') ?? '').trim();
		const field = String(form.get('field') ?? '').trim();
		const rawValue = String(form.get('value') ?? '');

		if (!rowId || !field) {
			return fail(400, {
				ok: false as const,
				error: 'Missing row or field.',
				rowId,
				field
			});
		}

		const columns = columnsForTable(table);
		const column = columns.find((c) => c.key === field);
		if (!column || !editableKeys(columns).has(field)) {
			return fail(400, {
				ok: false as const,
				error: 'Field is not editable.',
				rowId,
				field
			});
		}

		const parsed = parseCellValue(column, rawValue);
		if (!parsed.ok) {
			return fail(400, { ok: false as const, error: parsed.error, rowId, field });
		}

		try {
			const db = getDb();

			if (table === 'survey_axes') {
				const set: Partial<{
					label: string;
					positivePole: string;
					negativePole: string;
					displayOrder: number;
				}> = {};
				if (field === 'label') set.label = parsed.value as string;
				else if (field === 'positive_pole') set.positivePole = parsed.value as string;
				else if (field === 'negative_pole') set.negativePole = parsed.value as string;
				else if (field === 'display_order') set.displayOrder = parsed.value as number;

				const [updated] = await db
					.update(surveyAxes)
					.set(set)
					.where(eq(surveyAxes.id, rowId))
					.returning({ id: surveyAxes.id });

				if (!updated) {
					return fail(404, { ok: false as const, error: 'Row not found.', rowId, field });
				}
			} else {
				const set: Partial<{
					text: string;
					position: number;
					active: boolean;
				}> = {};
				if (field === 'text') set.text = parsed.value as string;
				else if (field === 'position') set.position = parsed.value as number;
				else if (field === 'active') set.active = parsed.value as boolean;

				const [updated] = await db
					.update(surveyQuestions)
					.set(set)
					.where(eq(surveyQuestions.id, rowId))
					.returning({ id: surveyQuestions.id });

				if (!updated) {
					return fail(404, { ok: false as const, error: 'Row not found.', rowId, field });
				}
			}

			return {
				ok: true as const,
				rowId,
				field,
				value: parsed.value
			};
		} catch (err) {
			console.error('updateCell failed', err);
			return fail(503, {
				ok: false as const,
				error: 'Could not save — check database connectivity or unique constraints.',
				rowId,
				field
			});
		}
	},

	createQuestion: async ({ request, locals, params }) => {
		if (!hasAtLeast(locals.accessRole, 'developer')) {
			return fail(403, { ok: false as const, error: 'Developer access required.' });
		}
		if (params.table !== 'survey_questions') {
			return fail(400, { ok: false as const, error: 'Create is only supported for survey_questions.' });
		}

		const form = await request.formData();
		const bankRaw = String(form.get('bank') ?? '').trim();
		const axisId = String(form.get('axis_id') ?? '').trim();
		const text = String(form.get('text') ?? '').trim();

		if (bankRaw !== 'quick_vibe' && bankRaw !== 'deep_dive') {
			return fail(400, { ok: false as const, error: 'bank must be quick_vibe or deep_dive.' });
		}
		if (!['y', 'x', 'z', 'w'].includes(axisId)) {
			return fail(400, { ok: false as const, error: 'axis_id must be y, x, z, or w.' });
		}
		if (!text) {
			return fail(400, { ok: false as const, error: 'Question text cannot be empty.' });
		}
		if (text.length > 2000) {
			return fail(400, { ok: false as const, error: 'Question text is too long.' });
		}

		try {
			const db = getDb();
			const existing = await db
				.select({
					id: surveyQuestions.id,
					bank: surveyQuestions.bank,
					axis_id: surveyQuestions.axisId,
					position: surveyQuestions.position
				})
				.from(surveyQuestions);

			const { id, position } = nextQuestionIdentity(existing, bankRaw, axisId);
			await db.insert(surveyQuestions).values({
				id,
				bank: bankRaw,
				axisId,
				text,
				position,
				active: true
			});

			return { ok: true as const, createdId: id };
		} catch (err) {
			console.error('createQuestion failed', err);
			return fail(503, {
				ok: false as const,
				error: 'Could not create question — check database connectivity or unique constraints.'
			});
		}
	},

	deleteQuestion: async ({ request, locals, params }) => {
		if (!hasAtLeast(locals.accessRole, 'developer')) {
			return fail(403, { ok: false as const, error: 'Developer access required.' });
		}
		if (params.table !== 'survey_questions') {
			return fail(400, { ok: false as const, error: 'Delete is only supported for survey_questions.' });
		}

		const form = await request.formData();
		const rowId = String(form.get('rowId') ?? '').trim();
		if (!rowId) {
			return fail(400, { ok: false as const, error: 'Missing row id.' });
		}

		try {
			const db = getDb();
			const [deleted] = await db
				.delete(surveyQuestions)
				.where(eq(surveyQuestions.id, rowId))
				.returning({ id: surveyQuestions.id });

			if (!deleted) {
				return fail(404, { ok: false as const, error: 'Question not found.' });
			}

			return { ok: true as const, deletedId: rowId };
		} catch (err) {
			console.error('deleteQuestion failed', err);
			return fail(503, {
				ok: false as const,
				error: 'Could not delete — check database connectivity.'
			});
		}
	},

	replaceFromCsv: async ({ request, locals, params }) => {
		if (!hasAtLeast(locals.accessRole, 'developer')) {
			return fail(403, { ok: false as const, error: 'Developer access required.' });
		}
		if (!isContentTable(params.table)) {
			return fail(404, { ok: false as const, error: 'Unknown table.' });
		}

		const form = await request.formData();
		if (form.get('confirmation') !== 'REPLACE') {
			return fail(400, {
				ok: false as const,
				error: 'You must confirm that the current table will be replaced.'
			});
		}

		const upload = form.get('csv');
		if (!(upload instanceof File) || !upload.name) {
			return fail(400, { ok: false as const, error: 'Choose a CSV file.' });
		}
		if (upload.size > 2_000_000) {
			return fail(413, { ok: false as const, error: 'CSV must be smaller than 2 MB.' });
		}

		try {
			const csv = await upload.text();
			const db = getDb();

			if (params.table === 'survey_questions') {
				const rows = parseQuestionImport(csv);
				const existingAxes = await db.select({ id: surveyAxes.id, displayOrder: surveyAxes.displayOrder }).from(surveyAxes);
				const validAxes = new Set(existingAxes.map((r) => r.id));
				const unknownAxes = [...new Set(rows.map((row) => row.axisId))].filter(
					(axis) => !validAxes.has(axis)
				);

				await db.transaction(async (tx) => {
					// Auto-insert placeholder rows for any axis IDs in the CSV that don't exist yet.
					if (unknownAxes.length) {
						const maxOrder = existingAxes.reduce((m, r) => Math.max(m, r.displayOrder), 0);
						const newAxes = unknownAxes.map((axisId, i) => ({
							id: axisId,
							label: axisId.toUpperCase(),
							positivePole: `${axisId}+`,
							negativePole: `${axisId}−`,
							displayOrder: maxOrder + i + 1
						}));
						await tx.insert(surveyAxes).values(newAxes).onConflictDoNothing();
					}
					await tx.delete(surveyQuestions);
					await tx.insert(surveyQuestions).values(rows);
				});
				return {
					ok: true as const,
					importOk: true as const,
					importedRows: rows.length,
					table: params.table
				};
			}

			const rows = parseAxisImport(csv);
			const importedIds = new Set(rows.map((row) => row.id));
			const referenced = await db
				.selectDistinct({ axisId: surveyQuestions.axisId })
				.from(surveyQuestions);
			const omittedReferenced = referenced
				.map((row) => row.axisId)
				.filter((axisId) => !importedIds.has(axisId));
			if (omittedReferenced.length) {
				throw new Error(
					`Cannot remove axes referenced by survey_questions: ${omittedReferenced.join(', ')}.`
				);
			}

			await db.transaction(async (tx) => {
				// Free existing unique order values so CSV rows can reorder axes safely.
				await tx
					.update(surveyAxes)
					.set({ displayOrder: sql`${surveyAxes.displayOrder} * -1` });
				for (const row of rows) {
					await tx
						.insert(surveyAxes)
						.values(row)
						.onConflictDoUpdate({
							target: surveyAxes.id,
							set: {
								label: row.label,
								positivePole: row.positivePole,
								negativePole: row.negativePole,
								displayOrder: row.displayOrder
							}
						});
				}
				await tx.delete(surveyAxes).where(notInArray(surveyAxes.id, rows.map((row) => row.id)));
			});
			return {
				ok: true as const,
				importOk: true as const,
				importedRows: rows.length,
				table: params.table
			};
		} catch (err) {
			console.error('replaceFromCsv failed', err);
			const message =
				err instanceof Error && !/duplicate key|constraint|connect|ENOTFOUND/i.test(err.message)
					? err.message
					: 'Import failed. Check the CSV values, database connection, and unique constraints.';
			return fail(400, { ok: false as const, error: message });
		}
	}
};
