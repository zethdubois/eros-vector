<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// ── Selection ────────────────────────────────────────────────────────────
	let selected = $state<Set<string>>(new Set());

	const allIds = $derived(data.rows.map((r) => r.id));
	const allChecked = $derived(allIds.length > 0 && allIds.every((id) => selected.has(id)));
	const someChecked = $derived(selected.size > 0 && !allChecked);

	function toggleAll() {
		if (allChecked) {
			selected = new Set();
		} else {
			selected = new Set(allIds);
		}
	}

	function toggleRow(id: string) {
		const next = new Set(selected);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selected = next;
	}

	// ── Two-step delete ──────────────────────────────────────────────────────
	let confirmPending = $state(false);
	let confirmTimer: ReturnType<typeof setTimeout> | null = null;
	let deleting = $state(false);
	let notice = $state<string | null>(null);

	function handleDelete() {
		if (selected.size === 0 || !data.canDelete) return;
		if (!confirmPending) {
			confirmPending = true;
			confirmTimer = setTimeout(() => {
				confirmPending = false;
				confirmTimer = null;
			}, 3000);
		} else {
			commitDelete();
		}
	}

	async function commitDelete() {
		if (confirmTimer) clearTimeout(confirmTimer);
		confirmTimer = null;
		confirmPending = false;
		deleting = true;
		notice = null;

		const fd = new FormData();
		fd.set('ids', [...selected].join(','));

		try {
			const res = await fetch('?/deleteRows', { method: 'POST', body: fd });
			const result = deserialize(await res.text());
			if (result.type === 'success' && result.data && 'ok' in result.data && result.data.ok) {
				const count = (result.data as { deletedCount: number }).deletedCount;
				notice = `Deleted ${count} record${count === 1 ? '' : 's'}.`;
				selected = new Set();
				await invalidateAll();
			} else if (result.type === 'failure' && result.data && 'error' in result.data) {
				notice = String(result.data.error);
			} else {
				notice = 'Delete failed.';
			}
		} catch {
			notice = 'Delete failed — network error.';
		} finally {
			deleting = false;
		}
	}

	// ── Formatting ───────────────────────────────────────────────────────────
	function shortId(id: string) {
		return id.slice(0, 8);
	}

	function fmtDate(d: Date | string | null) {
		if (!d) return '—';
		const dt = typeof d === 'string' ? new Date(d) : d;
		return dt.toLocaleString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<header class="page-head">
	<div class="title-row">
		<h1>survey_responses</h1>
		<span class="count">{data.rows.length} row{data.rows.length === 1 ? '' : 's'}</span>
	</div>
</header>

{#if notice}
	<p class="notice" role="status">{notice}</p>
{/if}

<div class="toolbar">
	{#if data.canDelete}
		<span class="sel-count">
			{#if selected.size > 0}
				{selected.size} selected
			{:else}
				Select rows to delete
			{/if}
		</span>
		<button
			type="button"
			class="delete-btn"
			class:confirm={confirmPending}
			disabled={selected.size === 0 || deleting}
			onclick={handleDelete}
		>
			{#if deleting}
				Deleting…
			{:else if confirmPending}
				Confirm delete {selected.size}?
			{:else}
				Delete selected
			{/if}
		</button>
	{/if}
</div>

<div class="table-wrap">
	<table class="results-table">
		<thead>
			<tr>
				{#if data.canDelete}
					<th class="col-check">
						<input
							type="checkbox"
							checked={allChecked}
							indeterminate={someChecked}
							onchange={toggleAll}
							aria-label="Select all"
						/>
					</th>
				{/if}
				<th class="col-id">ID</th>
				<th class="col-meta">Role</th>
				<th class="col-meta">Status</th>
				<th class="col-meta">Phase</th>
				<th class="col-meta">Visitor</th>
				<th class="col-meta">Region</th>
				<th class="col-dt">Started</th>
				<th class="col-dt">Updated</th>
				<th class="col-dt">Completed</th>
			</tr>
		</thead>
		<tbody>
			{#if data.rows.length === 0}
				<tr>
					<td colspan={data.canDelete ? 10 : 9} class="empty">No records yet.</td>
				</tr>
			{:else}
				{#each data.rows as row (row.id)}
					<tr class:selected={selected.has(row.id)}>
						{#if data.canDelete}
							<td class="col-check">
								<input
									type="checkbox"
									checked={selected.has(row.id)}
									onchange={() => toggleRow(row.id)}
									aria-label="Select row {shortId(row.id)}"
								/>
							</td>
						{/if}
						<td class="col-id">
							<span class="mono" title={row.id}>{shortId(row.id)}</span>
						</td>
						<td class="col-meta">
							<span class="badge role-{row.role ?? 'none'}">{row.role ?? '—'}</span>
						</td>
						<td class="col-meta">
							<span class="badge status-{row.status}">{row.status}</span>
						</td>
						<td class="col-meta mono">{row.phase}</td>
						<td class="col-meta">
							<span class="mono muted" title={row.visitorId}>{shortId(row.visitorId)}</span>
						</td>
						<td class="col-meta">{row.visitorRegion ?? '—'}</td>
						<td class="col-dt">{fmtDate(row.startedAt)}</td>
						<td class="col-dt">{fmtDate(row.updatedAt)}</td>
						<td class="col-dt">{fmtDate(row.completedAt)}</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<style>
	.page-head {
		margin-bottom: 1rem;
	}

	.title-row {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
	}

	h1 {
		margin: 0;
		font-family: ui-monospace, 'Cascadia Code', Menlo, monospace;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.count {
		font-size: 0.8rem;
		color: var(--muted);
	}

	.notice {
		margin: 0 0 1rem;
		font-size: 0.88rem;
		color: var(--accent);
	}

	/* ── Toolbar ── */
	.toolbar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
		min-height: 2rem;
	}

	.sel-count {
		font-size: 0.8rem;
		color: var(--muted);
	}

	.delete-btn {
		padding: 0.25rem 0.65rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		color: var(--muted);
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			border-color 0.15s,
			color 0.15s,
			background 0.15s;
	}

	.delete-btn:hover:not(:disabled) {
		border-color: var(--danger);
		color: var(--danger);
	}

	.delete-btn.confirm {
		border-color: var(--danger);
		background: color-mix(in srgb, var(--danger) 8%, var(--surface));
		color: var(--danger);
	}

	.delete-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* ── Table ── */
	.table-wrap {
		overflow-x: auto;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
	}

	.results-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8rem;
		table-layout: auto;
	}

	.results-table th,
	.results-table td {
		border-bottom: 1px solid var(--border);
		border-right: 1px solid var(--border);
		padding: 0.45rem 0.6rem;
		text-align: left;
		vertical-align: middle;
		white-space: nowrap;
	}

	.results-table th:last-child,
	.results-table td:last-child {
		border-right: 0;
	}

	.results-table tbody tr:last-child td {
		border-bottom: 0;
	}

	.results-table th {
		background: var(--bg);
		color: var(--muted);
		font-family: ui-monospace, 'Cascadia Code', Menlo, monospace;
		font-size: 0.72rem;
		font-weight: 600;
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.results-table tbody tr:hover td {
		background: color-mix(in srgb, var(--accent) 3%, transparent);
	}

	.results-table tbody tr.selected td {
		background: color-mix(in srgb, var(--danger) 5%, transparent);
	}

	/* ── Column widths ── */
	.col-check {
		width: 2.25rem;
		text-align: center;
	}

	.col-id {
		width: 6rem;
	}

	.col-meta {
		width: 7rem;
	}

	.col-dt {
		width: 9.5rem;
		color: var(--muted);
	}

	/* ── Checkbox ── */
	input[type='checkbox'] {
		width: 0.95rem;
		height: 0.95rem;
		accent-color: var(--danger);
		cursor: pointer;
		display: block;
		margin: 0 auto;
	}

	/* ── Misc ── */
	.mono {
		font-family: ui-monospace, 'Cascadia Code', Menlo, monospace;
		font-size: 0.75rem;
	}

	.muted {
		color: var(--muted);
	}

	.empty {
		text-align: center;
		padding: 2rem 1rem;
		color: var(--muted);
	}

	/* ── Badges ── */
	.badge {
		display: inline-block;
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: lowercase;
		letter-spacing: 0.02em;
	}

	.status-complete {
		background: color-mix(in srgb, var(--accent) 14%, transparent);
		color: var(--accent);
	}

	.status-in_progress {
		background: color-mix(in srgb, #b45309 12%, transparent);
		color: #b45309;
	}

	.status-abandoned {
		background: color-mix(in srgb, var(--muted) 15%, transparent);
		color: var(--muted);
	}

	.role-developer {
		background: color-mix(in srgb, #7c3aed 12%, transparent);
		color: #7c3aed;
	}

	.role-reviewer {
		background: color-mix(in srgb, #0284c7 12%, transparent);
		color: #0284c7;
	}

	.role-beta {
		background: color-mix(in srgb, var(--accent) 12%, transparent);
		color: var(--accent);
	}

	.role-none {
		background: transparent;
		color: var(--muted);
	}
</style>
