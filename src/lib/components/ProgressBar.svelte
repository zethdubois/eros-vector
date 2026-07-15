<script lang="ts">
	import type { Phase, Routing } from '$lib/types';

	type StepId = 'intake' | 't0' | 't1' | 't2' | 't3';

	let {
		phase,
		routing,
		horizonIncluded,
		eraCount = 0
	}: {
		phase: Phase;
		routing: Routing | null;
		horizonIncluded: boolean | null;
		eraCount?: number;
	} = $props();

	const pastSkipped = $derived(
		!!routing?.t0 && eraCount === 0 && phase !== 't0' && phase !== 'pause-t0' && phase !== 'intake'
	);

	const steps = $derived.by(() => {
		const list: { id: StepId; label: string; optional?: boolean }[] = [
			{ id: 'intake', label: 'Intake' }
		];
		if (!routing || routing.t0) list.push({ id: 't0', label: 'Past' });
		list.push({ id: 't1', label: 'Present' });
		if (routing?.finalForm) {
			list.push({ id: 't2', label: 'Final Form' });
		} else {
			list.push({ id: 't2', label: 'Aspiration' });
			if (routing?.t3) {
				list.push({ id: 't3', label: 'Horizon', optional: true });
			}
		}
		return list;
	});

	const progress = $derived.by(() => {
		const ids = steps.map((s) => s.id);
		const idx = (id: StepId) => ids.indexOf(id);

		let doneThrough = -1;
		let currentId: StepId | null = ids[0] ?? null;
		const skippedIds: StepId[] = [];

		if (pastSkipped) skippedIds.push('t0');
		if (horizonIncluded === false && ids.includes('t3')) skippedIds.push('t3');

		switch (phase) {
			case 'intake':
				doneThrough = -1;
				currentId = 'intake';
				break;
			case 't0':
			case 'pause-t0':
				doneThrough = idx('t0') - 1;
				currentId = phase === 'pause-t0' ? (ids.includes('t1') ? 't1' : 't0') : 't0';
				if (phase === 'pause-t0' && idx('t0') >= 0) doneThrough = idx('t0');
				break;
			case 't1':
			case 'pause-t1':
				doneThrough = pastSkipped ? idx('intake') : idx('t1') - 1;
				currentId = phase === 'pause-t1' ? 't2' : 't1';
				if (phase === 'pause-t1') doneThrough = idx('t1');
				break;
			case 't2':
			case 'pause-t2':
				doneThrough = pastSkipped ? idx('t1') : idx('t2') - 1;
				if (routing?.finalForm || !routing?.t3) {
					currentId = phase === 'pause-t2' ? null : 't2';
				} else {
					currentId = phase === 'pause-t2' ? 't3' : 't2';
				}
				if (phase === 'pause-t2') doneThrough = idx('t2');
				break;
			case 't3':
			case 'pause-t3':
				doneThrough = idx('t3') - 1;
				currentId = phase === 'pause-t3' ? null : 't3';
				if (phase === 'pause-t3' && idx('t3') >= 0) doneThrough = idx('t3');
				break;
			case 'complete':
				doneThrough = ids.length - 1;
				currentId = null;
				break;
		}

		return { doneThrough, currentId, skippedIds };
	});
</script>

<nav class="progress" aria-label="Survey progress">
	<ol>
		{#each steps as step, i}
			<li
				class:done={i <= progress.doneThrough && !progress.skippedIds.includes(step.id)}
				class:current={step.id === progress.currentId}
				class:upcoming={progress.currentId !== null &&
					i > (steps.findIndex((s) => s.id === progress.currentId) ?? -1) &&
					!progress.skippedIds.includes(step.id)}
				class:optional={step.optional &&
					horizonIncluded === null &&
					(phase === 'pause-t2' || phase === 't3' || phase === 'pause-t3')}
				class:skipped={progress.skippedIds.includes(step.id)}
			>
				<span class="dot" aria-hidden="true"></span>
				<span class="label">
					{step.label}
					{#if step.optional &&
						horizonIncluded === null &&
						(phase === 'pause-t2' || phase === 't3' || phase === 'pause-t3')}
						<span class="opt-tag">optional</span>
					{/if}
				</span>
			</li>
		{/each}
	</ol>
</nav>

<style>
	.progress {
		flex-shrink: 0;
		margin-bottom: 1.5rem;
	}

	ol {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		list-style: none;
		padding: 0;
		margin: 0;
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

	li.optional .dot {
		border: 1px dashed var(--border);
		background: transparent;
		box-sizing: border-box;
	}

	li.skipped {
		opacity: 0.45;
		text-decoration: line-through;
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

	.opt-tag {
		font-size: 0.68rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--muted);
		margin-left: 0.15rem;
	}
</style>
