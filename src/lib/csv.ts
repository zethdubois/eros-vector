/** Minimal CSV helpers for backstage table export. */

export function escapeCsvCell(value: string | number | boolean | null | undefined): string {
	const raw = value == null ? '' : String(value);
	if (/[",\n\r]/.test(raw)) {
		return `"${raw.replace(/"/g, '""')}"`;
	}
	return raw;
}

export function rowsToCsv(
	columns: { key: string; label: string }[],
	rows: Record<string, string | number | boolean>[]
): string {
	const header = columns.map((c) => escapeCsvCell(c.label)).join(',');
	const lines = rows.map((row) =>
		columns.map((c) => escapeCsvCell(row[c.key])).join(',')
	);
	return [header, ...lines].join('\n');
}

/** Parse RFC 4180-style CSV, including quoted commas, quotes, and newlines. */
export function parseCsv(csv: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let cell = '';
	let quoted = false;

	for (let i = 0; i < csv.length; i += 1) {
		const char = csv[i];
		if (quoted) {
			if (char === '"' && csv[i + 1] === '"') {
				cell += '"';
				i += 1;
			} else if (char === '"') {
				quoted = false;
			} else {
				cell += char;
			}
		} else if (char === '"') {
			if (cell.length > 0) throw new Error('Unexpected quote in unquoted CSV field.');
			quoted = true;
		} else if (char === ',') {
			row.push(cell);
			cell = '';
		} else if (char === '\n' || char === '\r') {
			if (char === '\r' && csv[i + 1] === '\n') i += 1;
			row.push(cell);
			if (row.some((value) => value.length > 0)) rows.push(row);
			row = [];
			cell = '';
		} else {
			cell += char;
		}
	}

	if (quoted) throw new Error('Unclosed quoted CSV field.');
	row.push(cell);
	if (row.some((value) => value.length > 0)) rows.push(row);
	return rows;
}

export function downloadCsv(filename: string, csv: string) {
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
