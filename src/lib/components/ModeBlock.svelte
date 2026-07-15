<script lang="ts">
	import { MODE_PROMPTS } from '$lib/questions';

	let {
		mode,
		children
	}: {
		mode: 'scouting' | 'bound';
		children: import('svelte').Snippet;
	} = $props();

	const title = $derived(mode === 'scouting' ? 'Scouting Mode' : 'Bound Mode');
	const subtitle = $derived(MODE_PROMPTS[mode]);
</script>

<section class="mode" class:bound={mode === 'bound'} class:scouting={mode === 'scouting'}>
	<header>
		<h3>{title}</h3>
		<p>{subtitle}</p>
	</header>
	{@render children()}
</section>

<style>
	.mode {
		margin: 1.5rem 0;
		padding: 1.25rem;
		border-left: 3px solid var(--accent);
		background: var(--surface);
		border-radius: 0 8px 8px 0;
	}

	.mode.bound {
		border-left-color: var(--bound);
	}

	.mode.scouting {
		border-left-color: var(--scouting);
	}

	header {
		margin-bottom: 1rem;
	}

	h3 {
		margin: 0 0 0.35rem;
		font-size: 1.15rem;
	}

	p {
		margin: 0;
		font-size: 0.9rem;
		color: var(--muted);
	}
</style>
