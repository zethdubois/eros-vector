<script lang="ts">
	import { navigateToSection, type SurveyState } from '$lib/store';
	import {
		canNavigateToSection,
		isHorizonSkipped,
		isPastSkipped,
		sectionNavLabel,
		sectionOrder,
		type SectionId
	} from '$lib/surveyNav';

	let {
		state: surveyState,
		canClear = false,
		onClear
	}: {
		state: SurveyState;
		canClear?: boolean;
		onClear?: () => void;
	} = $props();

	const pastSkipped = $derived(isPastSkipped(surveyState));
	const horizonSkipped = $derived(isHorizonSkipped(surveyState));

	const steps = $derived.by(() => {
		const order = sectionOrder(surveyState);
		return order.map((id) => ({
			id,
			label: sectionNavLabel(id, surveyState),
			optional: id === 't3'
		}));
	});

	const progress = $derived.by(() => {
		const ids = steps.map((s) => s.id);
		const idx = (id: SectionId) => ids.indexOf(id);

		let doneThrough = -1;
		let currentId: SectionId | null = ids[0] ?? null;
		const skippedIds: SectionId[] = [];

		if (pastSkipped) skippedIds.push('t0');
		if (horizonSkipped) skippedIds.push('t3');

		switch (surveyState.phase) {
			case 'intake':
				doneThrough = -1;
				currentId = ids[0] ?? null;
				break;
			case 't0':
			case 'pause-t0':
				doneThrough = idx('t0') - 1;
				currentId = surveyState.phase === 'pause-t0' ? (ids.includes('t1') ? 't1' : 't0') : 't0';
				if (surveyState.phase === 'pause-t0' && idx('t0') >= 0) doneThrough = idx('t0');
				break;
			case 't1':
			case 'pause-t1':
				doneThrough = pastSkipped ? idx('intake') : idx('t1') - 1;
				currentId = surveyState.phase === 'pause-t1' ? 't2' : 't1';
				if (surveyState.phase === 'pause-t1') doneThrough = idx('t1');
				break;
			case 't2':
			case 'pause-t2':
				doneThrough = pastSkipped ? idx('t1') : idx('t2') - 1;
				if (surveyState.routing?.finalForm || !surveyState.routing?.t3) {
					currentId = surveyState.phase === 'pause-t2' ? null : 't2';
				} else {
					currentId = surveyState.phase === 'pause-t2' ? 't3' : 't2';
				}
				if (surveyState.phase === 'pause-t2') doneThrough = idx('t2');
				break;
			case 't3':
			case 'pause-t3':
				doneThrough = idx('t3') - 1;
				currentId = surveyState.phase === 'pause-t3' ? null : 't3';
				if (surveyState.phase === 'pause-t3' && idx('t3') >= 0) doneThrough = idx('t3');
				break;
			case 'complete':
				doneThrough = ids.length - 1;
				currentId = null;
				break;
		}

		return { doneThrough, currentId, skippedIds };
	});

	function handleNav(id: SectionId) {
		if (!canNavigateToSection(surveyState, id)) return;
		navigateToSection(id);
	}

	// ── Clear Survey dual-press ─────────────────────────────────────────────
	let confirmPending = $state(false);
	let clearTimer: ReturnType<typeof setTimeout> | null = null;

	function handleClear() {
		if (!canClear || !onClear) return;
		if (!confirmPending) {
			confirmPending = true;
			clearTimer = setTimeout(() => {
				confirmPending = false;
				clearTimer = null;
			}, 3000);
		} else {
			if (clearTimer) clearTimeout(clearTimer);
			clearTimer = null;
			confirmPending = false;
			onClear();
		}
	}

	$effect(() => {
		return () => {
			if (clearTimer) clearTimeout(clearTimer);
		};
	});
</script>

<nav class="progress" aria-label="Survey progress">
	<ol>
		{#each steps as step, i}
			{@const navigable = canNavigateToSection(surveyState, step.id)}
			{@const isSkipped = progress.skippedIds.includes(step.id)}
			<li
				class:done={i <= progress.doneThrough && !isSkipped}
				class:current={step.id === progress.currentId}
				class:upcoming={progress.currentId !== null &&
					i > (steps.findIndex((s) => s.id === progress.currentId) ?? -1) &&
					!isSkipped}
				class:optional={step.optional &&
					surveyState.horizonIncluded === null &&
					(surveyState.phase === 'pause-t2' || surveyState.phase === 't3' || surveyState.phase === 'pause-t3')}
				class:skipped={isSkipped}
				class:navigable={navigable}
			>
				<span class="dot" aria-hidden="true"></span>
				{#if navigable}
					<button type="button" class="link" onclick={() => handleNav(step.id)}>
						{step.label}
						{#if isSkipped && (step.id === 't0' || step.id === 't3')}
							<span class="add-tag">+ add</span>
						{:else if step.optional &&
							surveyState.horizonIncluded === null &&
							(surveyState.phase === 'pause-t2' || surveyState.phase === 't3' || surveyState.phase === 'pause-t3')}
							<span class="opt-tag">optional</span>
						{/if}
					</button>
				{:else}
					<span class="label">
						{step.label}
						{#if step.optional &&
							surveyState.horizonIncluded === null &&
							(surveyState.phase === 'pause-t2' || surveyState.phase === 't3' || surveyState.phase === 'pause-t3')}
							<span class="opt-tag">optional</span>
						{/if}
					</span>
				{/if}
			</li>
		{/each}
	</ol>

	{#if canClear && onClear}
		<button
			type="button"
			class="clear-btn"
			class:confirm={confirmPending}
			onclick={handleClear}
		>
			{confirmPending ? 'Confirm Clear?' : 'Clear Survey'}
		</button>
	{/if}
</nav>

<style>
	.progress {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.25rem;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
	}

	.progress::-webkit-scrollbar {
		display: none;
	}

	ol {
		flex: 1;
		display: flex;
		flex-wrap: nowrap;
		gap: 0.5rem 0.85rem;
		list-style: none;
		padding: 0;
		margin: 0;
		width: max-content;
		min-width: 0;
	}

	@media (min-width: 700px) {
		.progress {
			overflow-x: visible;
		}

		ol {
			flex-wrap: wrap;
			width: auto;
			gap: 0.5rem 1rem;
		}
	}

	li {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.8rem;
		color: var(--muted);
	}

	li.current {
		color: var(--text);
		font-weight: 600;
	}

	li.done {
		color: var(--accent);
	}

	li.navigable.done .link {
		color: var(--accent);
	}

	li.optional .dot {
		border: 1px dashed var(--border);
		background: transparent;
		box-sizing: border-box;
	}

	li.skipped:not(.navigable) {
		opacity: 0.45;
		text-decoration: line-through;
	}

	li.skipped.navigable {
		opacity: 0.85;
	}

	.dot {
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 50%;
		background: var(--border);
		flex-shrink: 0;
	}

	li.current .dot {
		background: var(--accent);
	}

	li.done .dot {
		background: var(--accent);
	}

	.label {
		line-height: 1.3;
	}

	.link {
		padding: 0;
		border: none;
		background: none;
		font: inherit;
		color: inherit;
		cursor: pointer;
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, currentColor 35%, transparent);
		text-underline-offset: 0.15em;
		line-height: 1.3;
	}

	.link:hover {
		color: var(--accent);
		text-decoration-color: currentColor;
	}

	.opt-tag,
	.add-tag {
		font-size: 0.68rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--muted);
		margin-left: 0.15rem;
		text-decoration: none;
		display: inline;
	}

	.add-tag {
		color: var(--accent);
	}

	/* ── Clear Survey button ──────────────────────────────────────────────── */
	.clear-btn {
		flex-shrink: 0;
		padding: 0.2rem 0.6rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		color: var(--muted);
		font-size: 0.72rem;
		font-weight: 600;
		line-height: 1.4;
		cursor: pointer;
		white-space: nowrap;
		transition:
			border-color 0.15s ease,
			color 0.15s ease,
			background 0.15s ease;
	}

	.clear-btn:hover {
		border-color: var(--danger);
		color: var(--danger);
	}

	.clear-btn.confirm {
		border-color: var(--danger);
		background: color-mix(in srgb, var(--danger) 8%, var(--surface));
		color: var(--danger);
	}
</style>
