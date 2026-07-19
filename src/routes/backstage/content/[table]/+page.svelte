<script lang="ts">
	import { deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { downloadCsv, rowsToCsv } from '$lib/csv';
	import {
		nextQuestionIdentity,
		type TableCell,
		type TableColumn,
		type TableRow
	} from '$lib/contentTable';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type ViewMode = 'grouped' | 'table';

	let drafts = $state<Record<string, string>>({});
	let activeId = $state<string | null>(null);
	let notice = $state<string | null>(null);
	let savingId = $state<string | null>(null);
	let copiedId = $state<string | null>(null);
	let copiedAxisKey = $state<string | null>(null);
	let copiedTimer: ReturnType<typeof setTimeout> | null = null;

	let viewMode = $state<ViewMode>('grouped');
	let desktop = $state(false);
	let cellDrafts = $state<Record<string, string>>({});
	let savingCell = $state<string | null>(null);
	let tableRows = $state<TableRow[]>([]);
	let importOpen = $state(false);
	let creating = $state(false);
	let deletingId = $state<string | null>(null);
	let newAxisId = $state('y');
	let newBank = $state<'quick_vibe' | 'deep_dive'>('deep_dive');
	let newText = $state('');

	const VIEW_KEY = 'ev-content-view';

	const previewId = $derived.by(() => {
		const existing = tableRows.map((row) => ({
			id: String(row.id),
			bank: String(row.bank),
			axis_id: String(row.axis_id),
			position: Number(row.position) || 0
		}));
		return nextQuestionIdentity(existing, newBank, newAxisId).id;
	});

	const showRowActions = $derived(
		data.table === 'survey_questions' && data.canEdit && data.fromDb
	);

	$effect(() => {
		tableRows = data.rows.map((r) => ({ ...r }));
		cellDrafts = {};
	});

	$effect(() => {
		if (typeof window === 'undefined') return;
		const mq = window.matchMedia('(min-width: 900px)');
		const sync = () => {
			desktop = mq.matches;
			if (!mq.matches && viewMode === 'table') viewMode = 'grouped';
		};
		sync();
		mq.addEventListener('change', sync);

		const stored = localStorage.getItem(VIEW_KEY);
		if (stored === 'table' || stored === 'grouped') {
			viewMode = stored === 'table' && mq.matches ? 'table' : 'grouped';
		}

		return () => mq.removeEventListener('change', sync);
	});

	function setView(mode: ViewMode) {
		if (mode === 'table' && !desktop) return;
		viewMode = mode;
		localStorage.setItem(VIEW_KEY, mode);
	}

	function draftFor(id: string, saved: string): string {
		return drafts[id] ?? saved;
	}

	function setDraft(id: string, value: string) {
		drafts = { ...drafts, [id]: value };
	}

	function dirty(id: string, saved: string): boolean {
		return draftFor(id, saved) !== saved;
	}

	function flashCopied(kind: 'q' | 'axis', key: string) {
		if (copiedTimer) clearTimeout(copiedTimer);
		if (kind === 'q') {
			copiedId = key;
			copiedAxisKey = null;
		} else {
			copiedAxisKey = key;
			copiedId = null;
		}
		copiedTimer = setTimeout(() => {
			if (kind === 'q' && copiedId === key) copiedId = null;
			if (kind === 'axis' && copiedAxisKey === key) copiedAxisKey = null;
		}, 1200);
	}

	async function copyText(id: string, saved: string) {
		notice = null;
		try {
			await navigator.clipboard.writeText(draftFor(id, saved));
			flashCopied('q', id);
		} catch {
			notice = 'Could not copy — select the text manually.';
		}
	}

	async function copyAxisAll(
		bank: string,
		axis: string,
		questions: { id: string; text: string }[]
	) {
		notice = null;
		const key = `${bank}:${axis}`;
		const block = questions.map((q) => draftFor(q.id, q.text)).join('\n\n');
		try {
			await navigator.clipboard.writeText(block);
			flashCopied('axis', key);
		} catch {
			notice = 'Could not copy — select the text manually.';
		}
	}

	function cancelEdit(id: string) {
		const next = { ...drafts };
		delete next[id];
		drafts = next;
		activeId = null;
		notice = null;
		const el = document.activeElement;
		if (el instanceof HTMLElement && el.closest(`[data-q-box="${id}"]`)) {
			el.blur();
		}
	}

	function cellKey(rowId: string, field: string) {
		return `${rowId}::${field}`;
	}

	function cellDisplay(row: TableRow, col: TableColumn): string {
		const key = cellKey(String(row.id), col.key);
		if (key in cellDrafts) return cellDrafts[key];
		const v = row[col.key];
		if (typeof v === 'boolean') return v ? 'true' : 'false';
		return v == null ? '' : String(v);
	}

	function setCellDraft(rowId: string, field: string, value: string) {
		cellDrafts = { ...cellDrafts, [cellKey(rowId, field)]: value };
	}

	function cellDirty(row: TableRow, col: TableColumn): boolean {
		const key = cellKey(String(row.id), col.key);
		if (!(key in cellDrafts)) return false;
		const saved = row[col.key];
		const savedStr = typeof saved === 'boolean' ? (saved ? 'true' : 'false') : String(saved ?? '');
		return cellDrafts[key] !== savedStr;
	}

	async function saveCell(row: TableRow, col: TableColumn, explicit?: string) {
		if (!data.canEdit || !col.editable || !data.fromDb) return;

		const rowId = String(row.id);
		const key = cellKey(rowId, col.key);
		const value = explicit ?? cellDrafts[key];
		if (value == null) return;

		const saved = row[col.key];
		const savedStr =
			typeof saved === 'boolean' ? (saved ? 'true' : 'false') : String(saved ?? '');
		if (value === savedStr) {
			if (key in cellDrafts) {
				const draftsNext = { ...cellDrafts };
				delete draftsNext[key];
				cellDrafts = draftsNext;
			}
			return;
		}

		savingCell = key;
		notice = null;

		const fd = new FormData();
		fd.set('rowId', rowId);
		fd.set('field', col.key);
		fd.set('value', value);

		try {
			const res = await fetch('?/updateCell', {
				method: 'POST',
				body: fd
			});
			const result = deserialize(await res.text());
			if (result.type === 'success' && result.data && 'ok' in result.data && result.data.ok) {
				const nextVal = (result.data as { value: TableCell }).value;
				tableRows = tableRows.map((r) =>
					String(r.id) === rowId ? { ...r, [col.key]: nextVal } : r
				);
				const draftsNext = { ...cellDrafts };
				delete draftsNext[key];
				cellDrafts = draftsNext;
				notice = 'Saved.';
				await invalidateAll();
			} else if (result.type === 'failure' && result.data && 'error' in result.data) {
				notice = String(result.data.error);
			} else {
				notice = 'Could not save cell.';
			}
		} catch {
			notice = 'Could not save cell.';
		} finally {
			savingCell = null;
		}
	}

	function onSelectCell(row: TableRow, col: TableColumn, value: string) {
		setCellDraft(String(row.id), col.key, value);
		void saveCell(row, col, value);
	}

	/** Grow textarea with content so cells never clip. */
	function autosize(node: HTMLTextAreaElement, _content: string) {
		const fit = () => {
			node.style.height = 'auto';
			node.style.height = `${Math.max(node.scrollHeight, 44)}px`;
		};
		fit();
		node.addEventListener('input', fit);
		const ro = new ResizeObserver(fit);
		ro.observe(node);
		return {
			update() {
				fit();
			},
			destroy() {
				node.removeEventListener('input', fit);
				ro.disconnect();
			}
		};
	}

	function downloadTableCsv() {
		const csv = rowsToCsv(
			data.exportColumns.map((c) => ({ key: c.key, label: c.label })),
			tableRows
		);
		downloadCsv(`${data.table}.csv`, csv);
	}

	function confirmDelete(rowId: string): boolean {
		return window.confirm(
			`Delete question "${rowId}"?\n\nThis cannot be undone from here.`
		);
	}

	$effect(() => {
		if (!form) return;
		if (form.ok && 'importOk' in form && form.importOk && 'importedRows' in form) {
			notice = `Imported ${form.importedRows} rows.`;
			importOpen = false;
		} else if (form.ok && 'createdId' in form && form.createdId) {
			notice = `Created ${form.createdId}.`;
			newText = '';
			creating = false;
		} else if (form.ok && 'deletedId' in form && form.deletedId) {
			notice = `Deleted ${form.deletedId}.`;
			deletingId = null;
		} else if (form.ok && 'questionId' in form && form.questionId && 'text' in form && form.text) {
			const id = form.questionId;
			const next = { ...drafts };
			delete next[id];
			drafts = next;
			notice = 'Saved.';
			savingId = null;
			activeId = null;
		} else if (form.error) {
			notice = form.error;
			savingId = null;
			creating = false;
			deletingId = null;
		}
	});
</script>

<header class="page-head">
	<div class="title-row">
		<h1>{data.table}</h1>
		<div class="toolbar">
			{#if desktop}
				<div class="view-toggle" role="group" aria-label="View mode">
					<button
						type="button"
						class:active={viewMode === 'grouped'}
						onclick={() => setView('grouped')}
					>
						Grouped
					</button>
					<button
						type="button"
						class:active={viewMode === 'table'}
						onclick={() => setView('table')}
					>
						Table
					</button>
				</div>
			{/if}
			<button type="button" class="csv-btn" onclick={downloadTableCsv}>
				Download CSV
			</button>
			{#if data.canEdit}
				<button
					type="button"
					class="csv-btn upload"
					aria-expanded={importOpen}
					onclick={() => (importOpen = !importOpen)}
				>
					Upload CSV
				</button>
			{/if}
		</div>
	</div>
	{#if viewMode === 'grouped' && data.table === 'survey_questions' && data.canEdit}
		<p class="hint-edit">Click a question to edit. Cancel or Update appears while focused.</p>
	{/if}
	{#if viewMode === 'table' && data.canEdit}
		<p class="hint-edit">
			Edit cells inline — changes save on blur. Use the top blank row to add a question; trash deletes
			one row after confirm.
			{#if !data.fromDb}
				<span class="warn"> (database offline — edits disabled)</span>
			{/if}
		</p>
	{/if}
</header>

{#if importOpen}
	<section class="import-panel" aria-labelledby="import-title">
		<div>
			<h2 id="import-title">Replace {data.table} from CSV</h2>
			<p class="import-warning">
				<strong>Warning:</strong> this replaces the entire current table in one transaction. It is
				not an append or merge, and cannot be undone here. Download a backup first.
			</p>
			{#if data.table === 'survey_questions'}
				<p>
					The CSV must include <code>id, bank, axis_id, text, position, active</code>. All IDs,
					ordering positions, and active values in the database will be replaced.
				</p>
			{:else}
				<p>
					The CSV must include
					<code>id, label, positive_pole, negative_pole, display_order</code>. Referenced axis IDs
					cannot be removed.
				</p>
			{/if}
		</div>
		<form method="POST" action="?/replaceFromCsv" enctype="multipart/form-data">
			<label class="file-field">
				<span>CSV file</span>
				<input type="file" name="csv" accept=".csv,text/csv" required />
			</label>
			<label class="confirm-field">
				<span>Type <strong>REPLACE</strong> to confirm</span>
				<input
					type="text"
					name="confirmation"
					required
					pattern="REPLACE"
					autocomplete="off"
					spellcheck="false"
				/>
			</label>
			<div class="import-actions">
				<button type="button" onclick={() => (importOpen = false)}>Cancel</button>
				<button type="submit" class="danger">Replace table</button>
			</div>
		</form>
	</section>
{/if}

{#if notice}
	<p class="notice" role="status">{notice}</p>
{/if}

{#if viewMode === 'table'}
	<div class="table-wrap">
		<table class="cms-table" class:axes={data.table === 'survey_axes'}>
			<thead>
				<tr>
					{#each data.columns as col (col.key)}
						<th
							class:col-text={col.key === 'text'}
							class:col-meta={col.key !== 'text' && col.type !== 'boolean'}
							class:col-bool={col.type === 'boolean'}
						>
							{col.label}
						</th>
					{/each}
					{#if showRowActions}
						<th class="col-actions" aria-label="Actions"></th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#if showRowActions}
					<tr class="new-row">
						<td class="readonly col-meta">
							<span class="cell-text muted">{previewId}</span>
						</td>
						<td class="col-meta">
							<select bind:value={newAxisId}>
								<option value="y">y</option>
								<option value="x">x</option>
								<option value="z">z</option>
							</select>
						</td>
						<td class="col-meta">
							<select bind:value={newBank}>
								<option value="quick_vibe">quick_vibe</option>
								<option value="deep_dive">deep_dive</option>
							</select>
						</td>
						<td class="col-text">
							<textarea
								rows="2"
								placeholder="New question text…"
								bind:value={newText}
								use:autosize={newText}
							></textarea>
						</td>
						<td class="col-bool readonly">
							<span class="cell-text muted">—</span>
						</td>
						<td class="col-actions">
							<form
								method="POST"
								action="?/createQuestion"
								onsubmit={(e) => {
									if (!newText.trim()) {
										e.preventDefault();
										notice = 'Question text cannot be empty.';
										return;
									}
									creating = true;
									notice = null;
								}}
							>
								<input type="hidden" name="axis_id" value={newAxisId} />
								<input type="hidden" name="bank" value={newBank} />
								<input type="hidden" name="text" value={newText} />
								<button type="submit" class="add-btn" disabled={creating || !newText.trim()}>
									{creating ? 'Adding…' : 'Add'}
								</button>
							</form>
						</td>
					</tr>
				{/if}

				{#each tableRows as row (String(row.id))}
					<tr>
						{#each data.columns as col (col.key)}
							{@const key = cellKey(String(row.id), col.key)}
							{@const isDirty = cellDirty(row, col)}
							<td
								class:readonly={!col.editable}
								class:dirty={isDirty}
								class:saving={savingCell === key}
								class:col-text={col.key === 'text'}
								class:col-meta={col.key !== 'text' && col.type !== 'boolean'}
								class:col-bool={col.type === 'boolean'}
							>
								{#if data.canEdit && col.editable && data.fromDb}
									{#if col.type === 'boolean'}
										<label class="bool-cell">
											<input
												type="checkbox"
												checked={cellDisplay(row, col) === 'true'}
												onchange={(e) =>
													onSelectCell(
														row,
														col,
														e.currentTarget.checked ? 'true' : 'false'
													)}
											/>
										</label>
									{:else if col.key === 'text'}
										<textarea
											rows="2"
											value={cellDisplay(row, col)}
											use:autosize={cellDisplay(row, col)}
											oninput={(e) =>
												setCellDraft(String(row.id), col.key, e.currentTarget.value)}
											onblur={() => saveCell(row, col)}
										></textarea>
									{:else}
										<input
											type={col.type === 'number' ? 'number' : 'text'}
											value={cellDisplay(row, col)}
											oninput={(e) =>
												setCellDraft(String(row.id), col.key, e.currentTarget.value)}
											onblur={() => saveCell(row, col)}
										/>
									{/if}
								{:else if col.type === 'boolean'}
									<label class="bool-cell">
										<input
											type="checkbox"
											checked={cellDisplay(row, col) === 'true'}
											disabled
										/>
									</label>
								{:else}
									<span class="cell-text" class:long={col.key === 'text'}>
										{cellDisplay(row, col)}
									</span>
								{/if}
							</td>
						{/each}
						{#if showRowActions}
							<td class="col-actions">
								<form
									method="POST"
									action="?/deleteQuestion"
									onsubmit={(e) => {
										if (!confirmDelete(String(row.id))) {
											e.preventDefault();
											return;
										}
										deletingId = String(row.id);
										notice = null;
									}}
								>
									<input type="hidden" name="rowId" value={String(row.id)} />
									<button
										type="submit"
										class="delete-btn"
										aria-label={`Delete ${String(row.id)}`}
										title="Delete"
										disabled={deletingId === String(row.id)}
									>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
											<path
												d="M4 7h16M10 11v6M14 11v6M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"
												stroke="currentColor"
												stroke-width="1.8"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									</button>
								</form>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else if data.table === 'survey_axes'}
	<ul class="entries">
		{#each data.axes as axis (axis.axis)}
			<li>
				<p class="entry-title">{axis.label}</p>
				<p class="entry-meta">
					{axis.positivePole} ↔ {axis.negativePole}
				</p>
			</li>
		{/each}
	</ul>
{:else if data.table === 'survey_questions'}
	{#each data.questionGroups as group (group.bank)}
		<section class="bank">
			<h2>{group.bankLabel}</h2>
			<p class="hint">{group.hint}</p>

			{#each group.axes as axisGroup (axisGroup.axis)}
				{@const axisKey = `${group.bank}:${axisGroup.axis}`}
				{@const axisHeading = axisGroup.label.startsWith('Axis ')
					? axisGroup.label
					: `Axis ${axisGroup.label}`}
				<div class="axis">
					<div class="axis-head">
						<h3>{axisHeading}</h3>
						{#if axisGroup.questions.length > 1}
							<button
								type="button"
								class="copy-all"
								class:copied={copiedAxisKey === axisKey}
								onclick={() =>
									copyAxisAll(group.bank, axisGroup.axis, axisGroup.questions)}
							>
								{copiedAxisKey === axisKey ? 'Copied' : 'Copy all'}
							</button>
						{/if}
					</div>
					<ul class="q-list">
						{#each axisGroup.questions as q (q.id)}
							<li
								class="q-box"
								class:editing={data.canEdit && activeId === q.id}
								class:dirty={data.canEdit && dirty(q.id, q.text)}
								data-q-box={q.id}
							>
								<button
									type="button"
									class="copy-badge"
									class:copied={copiedId === q.id}
									aria-label={copiedId === q.id ? 'Copied' : 'Copy question text'}
									title={copiedId === q.id ? 'Copied' : 'Copy'}
									onclick={() => copyText(q.id, q.text)}
								>
									{#if copiedId === q.id}
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
											<path
												d="M5 13l4 4L19 7"
												stroke="currentColor"
												stroke-width="2.2"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									{:else}
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
											<rect
												x="9"
												y="9"
												width="11"
												height="11"
												rx="2"
												stroke="currentColor"
												stroke-width="2"
											/>
											<path
												d="M5 15V5a2 2 0 0 1 2-2h10"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
											/>
										</svg>
									{/if}
								</button>

								{#if data.canEdit}
									<form
										method="POST"
										action="?/updateQuestion"
										class="q-form"
										onsubmit={() => {
											savingId = q.id;
											notice = null;
										}}
									>
										<input type="hidden" name="questionId" value={q.id} />
										<textarea
											name="text"
											rows="4"
											value={draftFor(q.id, q.text)}
											oninput={(e) => setDraft(q.id, e.currentTarget.value)}
											onfocus={() => {
												activeId = q.id;
												notice = null;
											}}
											onblur={(e) => {
												const next = e.relatedTarget;
												if (
													next instanceof HTMLElement &&
													next.closest(`[data-q-box="${q.id}"]`)
												) {
													return;
												}
												activeId = null;
											}}
										></textarea>
										{#if activeId === q.id}
											<div class="q-actions">
												<button type="button" onclick={() => cancelEdit(q.id)}>
													Cancel
												</button>
												<button
													type="submit"
													disabled={savingId === q.id || !dirty(q.id, q.text)}
												>
													{savingId === q.id ? 'Saving…' : 'Update'}
												</button>
											</div>
										{/if}
									</form>
								{:else}
									<p class="q-text">{q.text}</p>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</section>
	{/each}
{/if}

<style>
	.page-head {
		margin-bottom: 1.25rem;
	}

	.title-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem 1rem;
	}

	h1 {
		margin: 0;
		font-family: ui-monospace, 'Cascadia Code', Menlo, monospace;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.view-toggle {
		display: inline-flex;
		border: 1px solid var(--border);
		border-radius: 6px;
		overflow: hidden;
		background: var(--surface);
	}

	.view-toggle button {
		padding: 0.35rem 0.7rem;
		border: 0;
		border-right: 1px solid var(--border);
		background: transparent;
		color: var(--muted);
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
	}

	.view-toggle button:last-child {
		border-right: 0;
	}

	.view-toggle button.active {
		background: var(--accent-soft);
		color: var(--accent);
	}

	.csv-btn {
		padding: 0.35rem 0.7rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		color: var(--text);
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
	}

	.csv-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.csv-btn.upload {
		border-color: color-mix(in srgb, var(--danger) 45%, var(--border));
	}

	.import-panel {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(17rem, 0.7fr);
		gap: 1.25rem;
		margin: 0 0 1.25rem;
		padding: 1rem;
		border: 1px solid color-mix(in srgb, var(--danger) 55%, var(--border));
		border-radius: 10px;
		background: var(--surface);
	}

	.import-panel h2 {
		margin: 0 0 0.45rem;
		font-size: 1rem;
	}

	.import-panel p {
		margin: 0.35rem 0 0;
		color: var(--muted);
		font-size: 0.84rem;
		line-height: 1.45;
	}

	.import-panel .import-warning {
		color: var(--danger);
	}

	.import-panel code {
		font-size: 0.78rem;
	}

	.import-panel form,
	.file-field,
	.confirm-field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.import-panel form {
		gap: 0.7rem;
	}

	.file-field span,
	.confirm-field span {
		font-size: 0.78rem;
		font-weight: 600;
	}

	.file-field input,
	.confirm-field input {
		width: 100%;
		box-sizing: border-box;
		padding: 0.5rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg);
		color: var(--text);
	}

	.import-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.import-actions button {
		padding: 0.45rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg);
		color: var(--text);
		font-weight: 600;
		cursor: pointer;
	}

	.import-actions .danger {
		border-color: var(--danger);
		background: var(--danger);
		color: white;
	}

	.hint-edit {
		margin: 0.45rem 0 0;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.warn {
		color: #b45309;
	}

	.notice {
		margin: 0 0 1rem;
		font-size: 0.88rem;
		color: var(--accent);
	}

	.table-wrap {
		overflow-x: auto;
		overflow-y: visible;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
		max-width: 100%;
	}

	.cms-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.82rem;
		table-layout: fixed;
	}

	.cms-table th,
	.cms-table td {
		border-bottom: 1px solid var(--border);
		border-right: 1px solid var(--border);
		padding: 0;
		vertical-align: top;
		text-align: left;
		overflow: visible;
	}

	.cms-table th:last-child,
	.cms-table td:last-child {
		border-right: 0;
	}

	.cms-table tbody tr:last-child td {
		border-bottom: 0;
	}

	.cms-table th {
		padding: 0.55rem 0.65rem;
		font-family: ui-monospace, 'Cascadia Code', Menlo, monospace;
		font-weight: 600;
		font-size: 0.75rem;
		color: var(--muted);
		background: var(--bg);
		white-space: nowrap;
		position: sticky;
		top: 0;
		z-index: 1;
	}

	/* Compact meta columns; text column takes the rest. */
	.cms-table th.col-meta,
	.cms-table td.col-meta {
		width: 8rem;
	}

	.cms-table th.col-text,
	.cms-table td.col-text {
		width: auto;
	}

	.cms-table th.col-bool,
	.cms-table td.col-bool {
		width: 4.5rem;
		text-align: center;
	}

	.cms-table th.col-actions,
	.cms-table td.col-actions {
		width: 3.25rem;
		text-align: center;
		vertical-align: middle;
	}

	/* survey_axes — no long text column; keep columns balanced */
	.cms-table.axes th,
	.cms-table.axes td {
		width: auto;
		text-align: left;
	}

	.new-row td {
		background: color-mix(in srgb, var(--accent-soft) 55%, var(--surface));
		border-bottom: 2px solid var(--border);
		padding-top: 0.55rem;
		padding-bottom: 0.55rem;
	}

	.new-row td:first-child {
		padding-left: 0.35rem;
	}

	.cell-text.muted {
		color: var(--muted);
		font-family: ui-monospace, 'Cascadia Code', Menlo, monospace;
		font-size: 0.78rem;
	}

	.add-btn,
	.delete-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg);
		color: var(--muted);
		cursor: pointer;
	}

	.add-btn {
		padding: 0.3rem 0.55rem;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--accent);
		border-color: var(--accent);
	}

	.add-btn:hover:not(:disabled) {
		background: var(--accent-soft);
	}

	.add-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.delete-btn {
		width: 2rem;
		padding: 0;
	}

	.delete-btn:hover:not(:disabled) {
		border-color: var(--danger);
		color: var(--danger);
	}

	.delete-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.bool-cell {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 2.25rem;
		padding: 0.35rem;
		cursor: pointer;
	}

	.bool-cell input {
		width: 1rem;
		height: 1rem;
		min-height: 0;
		margin: 0;
		accent-color: var(--accent);
		cursor: pointer;
	}

	.bool-cell input:disabled {
		cursor: default;
		opacity: 0.85;
	}

	.cms-table td.readonly {
		background: color-mix(in srgb, var(--bg) 55%, var(--surface));
	}

	.cms-table td.dirty {
		box-shadow: inset 0 0 0 1px var(--accent);
	}

	.cms-table td.saving {
		opacity: 0.7;
	}

	.cms-table input,
	.cms-table select,
	.cms-table textarea {
		display: block;
		width: 100%;
		min-height: 2.25rem;
		padding: 0.45rem 0.55rem;
		border: 0;
		border-radius: 0;
		background: transparent;
		color: var(--text);
		font: inherit;
		box-sizing: border-box;
	}

	.cms-table textarea {
		min-height: 2.75rem;
		height: auto;
		resize: none;
		line-height: 1.45;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		word-break: break-word;
		overflow: hidden;
		field-sizing: content;
	}

	.cms-table input:focus,
	.cms-table select:focus,
	.cms-table textarea:focus {
		outline: none;
		background: var(--bg);
	}

	.cell-text {
		display: block;
		padding: 0.45rem 0.55rem;
		line-height: 1.45;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		word-break: break-word;
	}

	.cell-text.long {
		min-width: 0;
		max-width: none;
	}

	.entries {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.entries li {
		padding: 1rem 1.1rem;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
	}

	.entry-title {
		margin: 0 0 0.3rem;
		font-weight: 600;
		font-size: 1.05rem;
	}

	.entry-meta {
		margin: 0;
		font-size: 0.9rem;
		color: var(--muted);
	}

	.bank {
		margin-bottom: 1.75rem;
	}

	.bank h2 {
		margin: 0 0 0.3rem;
		font-size: 1.1rem;
	}

	.hint {
		margin: 0 0 1rem;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.axis {
		margin-bottom: 1.25rem;
	}

	.axis-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem 0.75rem;
		margin-bottom: 0.65rem;
	}

	.axis h3 {
		margin: 0;
		font-size: 0.92rem;
		color: var(--accent);
	}

	.copy-all {
		padding: 0.3rem 0.6rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		color: var(--muted);
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
	}

	.copy-all:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.copy-all.copied {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-soft);
	}

	.q-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.q-box {
		position: relative;
		padding: 0.85rem 0.95rem;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
	}

	.q-box.editing {
		border-color: var(--accent);
	}

	.q-box.dirty {
		box-shadow: inset 3px 0 0 var(--accent);
	}

	.copy-badge {
		position: absolute;
		top: 0.45rem;
		right: 0.45rem;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		padding: 0;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg);
		color: var(--muted);
		cursor: pointer;
	}

	.copy-badge:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.copy-badge.copied {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-soft);
	}

	.q-text {
		margin: 0;
		padding-right: 2rem;
		line-height: 1.45;
		font-size: 0.95rem;
	}

	.q-form {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}

	.q-form textarea {
		width: 100%;
		padding: 0.55rem 2.25rem 0.55rem 0.65rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg);
		color: var(--text);
		font: inherit;
		font-size: 0.95rem;
		line-height: 1.45;
		resize: vertical;
		min-height: 5rem;
		box-sizing: border-box;
	}

	.q-form textarea:focus {
		outline: none;
		border-color: var(--accent);
	}

	.q-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	.q-actions button {
		padding: 0.4rem 0.75rem;
		min-height: 2.25rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg);
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
	}

	.q-actions button:hover:not(:disabled) {
		border-color: var(--accent);
		color: var(--accent);
	}

	.q-actions button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 899px) {
		.import-panel {
			grid-template-columns: 1fr;
		}
	}
</style>
