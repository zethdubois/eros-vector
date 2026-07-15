<script lang="ts">
	import type { Phase, Routing } from '$lib/types';

	let {
		phase,
		routing
	}: {
		phase: Phase;
		routing: Routing | null;
	} = $props();

	const steps = $derived.by(() => {
		const list: { id: Phase; label: string }[] = [{ id: 'intake', label: 'Intake' }];
		if (!routing || routing.t0) list.push({ id: 't0', label: 'Past (T0)' });
		list.push({ id: 't1', label: 'Present (T1)' });
		if (routing?.finalForm) {
			list.push({ id: 't2', label: 'Final Form' });
		} else {
			list.push({ id: 't2', label: 'Aspiration (T2)' });
			list.push({ id: 't3', label: 'Horizon (T3)' });
		}
		list.push({ id: 'results', label: 'Results' });
		return list;
	});

	const currentIndex = $derived(steps.findIndex((s) => s.id === phase));
</script>

<nav class="progress" aria-label="Survey progress">
	<ol>
		{#each steps as step, i}
			<li
				class:done={i < currentIndex}
				class:current={i === currentIndex}
				class:upcoming={i > currentIndex}
			>
				<span class="dot" aria-hidden="true"></span>
				<span class="label">{step.label}</span>
			</li>
		{/each}
	</ol>
</nav>

<style>
	.progress {
		margin-bottom: 2rem;
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

	.dot {
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 50%;
		background: var(--border);
	}

	li.current .dot {
		background: var(--accent);
	}

	li.done .dot {
		background: var(--accent);
	}
</style>
