<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import type { PageData } from './$types';
	import { AXIS_META } from '$lib/labels';
	import type { ResultSection } from '$lib/results';

	let { data }: { data: PageData } = $props();

	// ── Selection ────────────────────────────────────────────────────────────
	let selected = $state<Set<string>>(new Set());

	const allIds = $derived(data.rows.map((r) => r.id));
	const allChecked = $derived(allIds.length > 0 && allIds.every((id) => selected.has(id)));
	const someChecked = $derived(selected.size > 0 && !allChecked);

	function toggleAll() {
		if (allChecked) selected = new Set();
		else selected = new Set(allIds);
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

	// ── JSON modal ───────────────────────────────────────────────────────────
	type ModalTab = 'state' | 'results';
	type ModalRow = (typeof data.rows)[number];

	let modalRow = $state<ModalRow | null>(null);
	let modalTab = $state<ModalTab>('state');

	function openModal(row: ModalRow) {
		reportRow = null;
		modalRow = row;
		modalTab = 'state';
	}

	function closeModal() {
		modalRow = null;
	}

	// ── Report modal ─────────────────────────────────────────────────────────
	let reportRow = $state<ModalRow | null>(null);

	function openReport(row: ModalRow) {
		modalRow = null;
		reportRow = row;
	}

	function closeReport() {
		reportRow = null;
	}

	const reportSections = $derived.by((): ResultSection[] | null => {
		if (!reportRow?.results) return null;
		return reportRow.results as ResultSection[];
	});

	function fmtCoord(n: number): string {
		const sign = n >= 0 ? '+' : '';
		return `${sign}${n.toFixed(2)}`;
	}

	function onBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			closeModal();
			closeReport();
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			closeModal();
			closeReport();
		}
	}

	const modalJson = $derived.by(() => {
		if (!modalRow) return null;
		const val = modalTab === 'state' ? modalRow.state : modalRow.results;
		if (val == null) return null;
		return val;
	});

	// ── JSON syntax highlighting ─────────────────────────────────────────────
	function highlight(val: unknown, depth = 0): string {
		if (val === null) return `<span class="jn">null</span>`;
		if (typeof val === 'boolean') return `<span class="jb">${val}</span>`;
		if (typeof val === 'number') return `<span class="ji">${val}</span>`;
		if (typeof val === 'string') return `<span class="js">"${escHtml(val)}"</span>`;

		const indent = '  '.repeat(depth);
		const innerIndent = '  '.repeat(depth + 1);

		if (Array.isArray(val)) {
			if (val.length === 0) return `<span class="jp">[]</span>`;
			const items = val.map((v) => `${innerIndent}${highlight(v, depth + 1)}`).join(',\n');
			return `<span class="jp">[</span>\n${items}\n${indent}<span class="jp">]</span>`;
		}

		if (typeof val === 'object') {
			const entries = Object.entries(val as Record<string, unknown>);
			if (entries.length === 0) return `<span class="jp">{}</span>`;
			const lines = entries
				.map(([k, v]) => `${innerIndent}<span class="jk">"${escHtml(k)}"</span>: ${highlight(v, depth + 1)}`)
				.join(',\n');
			return `<span class="jp">{</span>\n${lines}\n${indent}<span class="jp">}</span>`;
		}

		return escHtml(String(val));
	}

	function escHtml(s: string) {
		return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

<svelte:window onkeydown={onKeydown} />

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
				<th class="col-peek">Peek</th>
			</tr>
		</thead>
		<tbody>
			{#if data.rows.length === 0}
				<tr>
					<td colspan={data.canDelete ? 11 : 10} class="empty">No records yet.</td>
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
						<td class="col-peek">
							<div class="peek-btns">
								<button
									type="button"
									class="peek-btn"
									onclick={() => openModal(row)}
									title="View raw state / results JSON"
								>data</button>
								<button
									type="button"
									class="peek-btn peek-btn--report"
									class:dim={row.results == null}
									onclick={() => openReport(row)}
									title="View human-readable report"
								>report</button>
							</div>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<!-- ── JSON modal ─────────────────────────────────────────────────────────── -->
{#if modalRow}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="backdrop" onclick={onBackdropClick} role="dialog" aria-modal="true" aria-label="JSON viewer" tabindex="-1">
		<div class="modal">
			<div class="modal-head">
				<div class="modal-meta">
					<span class="mono muted" title={modalRow.id}>{modalRow.id}</span>
				</div>
				<button type="button" class="modal-close" onclick={closeModal} aria-label="Close">✕</button>
			</div>

			<div class="modal-tabs">
				<button
					type="button"
					class="modal-tab"
					class:active={modalTab === 'state'}
					onclick={() => (modalTab = 'state')}
				>state</button>
				<button
					type="button"
					class="modal-tab"
					class:active={modalTab === 'results'}
					onclick={() => (modalTab = 'results')}
				>results {#if modalRow.results == null}<span class="tab-null">null</span>{/if}</button>
			</div>

			<div class="modal-body">
				{#if modalJson == null}
					<p class="json-null">null — no data recorded yet.</p>
				{:else}
					<pre class="json-tree">{@html highlight(modalJson)}</pre>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- ── Report modal ───────────────────────────────────────────────────────── -->
{#if reportRow}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="backdrop" onclick={onBackdropClick} role="dialog" aria-modal="true" aria-label="Report viewer" tabindex="-1">
		<div class="modal modal--report">
			<div class="modal-head">
				<div class="modal-meta">
					<span class="mono muted">{reportRow.id}</span>
					<span class="badge status-{reportRow.status}">{reportRow.status}</span>
					{#if reportRow.completedAt}
						<span class="rpt-completed">completed {fmtDate(reportRow.completedAt)}</span>
					{/if}
				</div>
				<button type="button" class="modal-close" onclick={closeReport} aria-label="Close">✕</button>
			</div>

			<div class="modal-body rpt-body">
				{#if !reportSections}
					<p class="rpt-empty">Survey in progress — no results recorded yet.</p>
				{:else}
					{#each reportSections as section}
						<section class="rpt-section">
							<h2 class="rpt-section-title">{section.phaseLabel}</h2>
							{#if section.context}
								<p class="rpt-context">{section.context}</p>
							{/if}

							{#each section.passes as pass}
								<div class="rpt-pass" class:rpt-pass--shadow={pass.shadow}>
									<!-- Pass header: mode + shadow -->
									<div class="rpt-pass-head">
										<span class="rpt-mode rpt-mode--{pass.mode}">{pass.mode}</span>
										{#if pass.shadow}
											<span class="rpt-shadow-tag">shadow</span>
										{/if}
									</div>

									<!-- Coordinates -->
									<div class="rpt-coords">
										{#each (['w', 'x', 'y', 'z'] as const) as axis}
											{@const meta = AXIS_META[axis]}
											{@const val = pass.coordinates[axis]}
											<div class="rpt-coord">
												<span class="rpt-axis-label" style="color: {meta.color}">{meta.label}</span>
												<span class="rpt-coord-domain">{meta.domain}</span>
												<span class="rpt-coord-val" class:rpt-coord-zero={val === 0}>{fmtCoord(val)}</span>
												<span class="rpt-coord-pole">{val === 0 ? 'balanced' : val > 0 ? meta.plus : meta.minus}</span>
											</div>
										{/each}
									</div>

									<!-- Archetype(s) -->
									{#if pass.archetypes.length > 1}
										<div class="rpt-coeq-label">co-equal archetypes</div>
										<div class="rpt-coeq-list">
											{#each pass.archetypes as arch}
												<div class="rpt-coeq-card">
													<span class="rpt-arch-name">{arch.name}</span>
													<span class="rpt-arch-tagline">{arch.tagline}</span>
												</div>
											{/each}
										</div>
										<p class="rpt-arch-sig rpt-arch-sig--coeq">
											<em>{pass.archetypes[0].signature}</em>
										</p>
									{:else}
										<div class="rpt-arch-block">
											<div class="rpt-arch-name">{pass.archetype.name}</div>
											<div class="rpt-arch-tagline">{pass.archetype.tagline}</div>
											<p class="rpt-arch-sig"><em>{pass.archetype.signature}</em></p>
										</div>
									{/if}

									<!-- Neighbours / influences -->
									{#if pass.neighbors.length > 0}
										<div class="rpt-nb-section">
											<div class="rpt-nb-label">influences</div>
											{#each pass.neighbors as nb}
												{@const meta = AXIS_META[nb.axis]}
												<div class="rpt-nb-row">
													<span class="rpt-nb-axis" style="color: {meta.color}">{meta.label}</span>
													<span class="rpt-nb-desc">
														{meta.domain} → <strong>{nb.approachingPole}</strong>
														<span class="rpt-nb-arch">({nb.archetype.name})</span>
													</span>
													<div class="rpt-nb-bar-wrap">
														<div
															class="rpt-nb-bar"
															style="width: {Math.round(nb.pullStrength * 100)}%; background: {meta.color}"
														></div>
													</div>
													<span class="rpt-nb-pct">{Math.round(nb.pullStrength * 100)}%</span>
												</div>
											{/each}
										</div>
									{/if}
								</div>
							{/each}
						</section>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}

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

	.col-id { width: 6rem; }
	.col-meta { width: 7rem; }
	.col-dt { width: 9.5rem; color: var(--muted); }
	.col-peek { width: 8rem; }

	/* ── Peek buttons ── */
	.peek-btns {
		display: flex;
		gap: 0.3rem;
	}

	.peek-btn {
		padding: 0.15rem 0.45rem;
		border: 1px solid var(--border);
		border-radius: 4px;
		background: var(--bg);
		color: var(--accent);
		font-family: ui-monospace, 'Cascadia Code', Menlo, monospace;
		font-size: 0.68rem;
		font-weight: 600;
		cursor: pointer;
		transition: border-color 0.12s, background 0.12s;
	}

	.peek-btn:hover {
		border-color: var(--accent);
		background: color-mix(in srgb, var(--accent) 8%, var(--bg));
	}

	.peek-btn.dim {
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

	.muted { color: var(--muted); }

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

	/* ── Modal backdrop ── */
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 200;
		background: color-mix(in srgb, var(--bg) 60%, transparent);
		backdrop-filter: blur(3px);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 3rem 1.25rem 1.25rem;
		overflow-y: auto;
	}

	/* ── Modal panel ── */
	.modal {
		width: 100%;
		max-width: 56rem;
		border: 1px solid var(--border);
		border-radius: 14px;
		background: var(--surface);
		box-shadow: 0 8px 40px color-mix(in srgb, #000 18%, transparent);
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.modal-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.85rem 1rem 0.75rem;
		border-bottom: 1px solid var(--border);
	}

	.modal-meta {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.72rem;
	}

	.modal-close {
		flex-shrink: 0;
		width: 1.75rem;
		height: 1.75rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: transparent;
		color: var(--muted);
		font-size: 0.8rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: border-color 0.12s, color 0.12s;
	}

	.modal-close:hover {
		border-color: var(--text);
		color: var(--text);
	}

	/* ── Modal tabs ── */
	.modal-tabs {
		display: flex;
		gap: 0;
		border-bottom: 1px solid var(--border);
		padding: 0 1rem;
	}

	.modal-tab {
		padding: 0.5rem 0.9rem;
		border: none;
		border-bottom: 2px solid transparent;
		background: transparent;
		color: var(--muted);
		font-family: ui-monospace, 'Cascadia Code', Menlo, monospace;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
		margin-bottom: -1px;
		transition: color 0.12s, border-color 0.12s;
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.modal-tab:hover {
		color: var(--text);
	}

	.modal-tab.active {
		color: var(--accent);
		border-bottom-color: var(--accent);
	}

	.tab-null {
		font-size: 0.65rem;
		font-weight: 500;
		color: var(--muted);
		background: color-mix(in srgb, var(--muted) 12%, transparent);
		border-radius: 3px;
		padding: 0.05rem 0.3rem;
	}

	/* ── JSON tree ── */
	.modal-body {
		padding: 1rem 1.1rem 1.25rem;
		overflow: auto;
		max-height: 70vh;
	}

	.json-null {
		margin: 0;
		font-size: 0.85rem;
		color: var(--muted);
		font-style: italic;
	}

	.json-tree {
		margin: 0;
		font-family: ui-monospace, 'Cascadia Code', Menlo, monospace;
		font-size: 0.78rem;
		line-height: 1.6;
		white-space: pre;
		color: var(--text);
	}

	/* syntax token colours */
	.json-tree :global(.jk) { color: #7c3aed; }          /* key — purple */
	.json-tree :global(.js) { color: #0284c7; }           /* string — blue */
	.json-tree :global(.ji) { color: #b45309; }           /* number — amber */
	.json-tree :global(.jb) { color: #059669; }           /* boolean — green */
	.json-tree :global(.jn) { color: var(--muted); }      /* null — muted */
	.json-tree :global(.jp) { color: var(--muted); }      /* punctuation */

	/* ── Report modal ── */
	.peek-btn--report {
		color: var(--text);
	}

	.modal--report {
		max-width: 48rem;
	}

	.modal-head .badge {
		margin-left: 0.5rem;
	}

	.rpt-completed {
		font-size: 0.72rem;
		color: var(--muted);
		margin-left: 0.5rem;
	}

	.rpt-body {
		padding: 1.25rem 1.25rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.rpt-empty {
		margin: 0;
		font-size: 0.88rem;
		color: var(--muted);
		font-style: italic;
	}

	/* Section */
	.rpt-section {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.rpt-section-title {
		margin: 0;
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--muted);
		border-bottom: 1px solid var(--border);
		padding-bottom: 0.4rem;
	}

	.rpt-context {
		margin: 0;
		font-size: 0.8rem;
		color: var(--muted);
		font-style: italic;
	}

	/* Pass card */
	.rpt-pass {
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 0.85rem 1rem;
		background: var(--bg);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.rpt-pass--shadow {
		opacity: 0.7;
	}

	.rpt-pass-head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.rpt-mode {
		display: inline-block;
		padding: 0.1rem 0.5rem;
		border-radius: 4px;
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.rpt-mode--bound {
		background: color-mix(in srgb, var(--accent) 14%, transparent);
		color: var(--accent);
	}

	.rpt-mode--scouting {
		background: color-mix(in srgb, var(--muted) 14%, transparent);
		color: var(--muted);
	}

	.rpt-shadow-tag {
		font-size: 0.65rem;
		color: var(--muted);
		padding: 0.1rem 0.35rem;
		border: 1px solid var(--border);
		border-radius: 3px;
	}

	/* Coordinates grid */
	.rpt-coords {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.4rem;
	}

	.rpt-coord {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 7px;
		padding: 0.5rem 0.6rem;
	}

	.rpt-axis-label {
		font-family: ui-monospace, 'Cascadia Code', Menlo, monospace;
		font-size: 0.78rem;
		font-weight: 800;
		line-height: 1;
	}

	.rpt-coord-domain {
		font-size: 0.65rem;
		color: var(--muted);
		line-height: 1;
	}

	.rpt-coord-val {
		font-family: ui-monospace, 'Cascadia Code', Menlo, monospace;
		font-size: 1rem;
		font-weight: 700;
		line-height: 1.2;
		margin-top: 0.2rem;
	}

	.rpt-coord-zero {
		color: var(--muted);
	}

	.rpt-coord-pole {
		font-size: 0.65rem;
		color: var(--muted);
		line-height: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Archetype block */
	.rpt-arch-block {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.rpt-arch-name {
		font-size: 1.05rem;
		font-weight: 700;
		line-height: 1.2;
	}

	.rpt-arch-tagline {
		font-size: 0.75rem;
		color: var(--muted);
	}

	.rpt-arch-sig {
		margin: 0.15rem 0 0;
		font-size: 0.82rem;
		color: var(--text);
		opacity: 0.8;
	}

	.rpt-arch-sig--coeq {
		margin-top: 0.3rem;
	}

	/* Co-equal */
	.rpt-coeq-label {
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--muted);
	}

	.rpt-coeq-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.rpt-coeq-card {
		display: flex;
		flex-direction: column;
		gap: 0.05rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 0.35rem 0.6rem;
	}

	.rpt-coeq-card .rpt-arch-name {
		font-size: 0.85rem;
	}

	.rpt-coeq-card .rpt-arch-tagline {
		font-size: 0.68rem;
	}

	/* Neighbours */
	.rpt-nb-section {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		padding-top: 0.4rem;
		border-top: 1px solid var(--border);
	}

	.rpt-nb-label {
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--muted);
		margin-bottom: 0.1rem;
	}

	.rpt-nb-row {
		display: grid;
		grid-template-columns: 1.4rem 1fr 8rem 2.5rem;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.78rem;
	}

	.rpt-nb-axis {
		font-family: ui-monospace, 'Cascadia Code', Menlo, monospace;
		font-weight: 800;
		font-size: 0.78rem;
	}

	.rpt-nb-desc {
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.rpt-nb-arch {
		font-size: 0.72rem;
		color: var(--muted);
		margin-left: 0.2rem;
	}

	.rpt-nb-bar-wrap {
		height: 5px;
		border-radius: 3px;
		background: color-mix(in srgb, var(--muted) 18%, transparent);
		overflow: hidden;
	}

	.rpt-nb-bar {
		height: 100%;
		border-radius: 3px;
		opacity: 0.7;
		transition: width 0.2s ease;
	}

	.rpt-nb-pct {
		font-size: 0.68rem;
		color: var(--muted);
		text-align: right;
		font-family: ui-monospace, 'Cascadia Code', Menlo, monospace;
	}
</style>
