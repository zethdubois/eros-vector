<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	let {
		title,
		phaseBlurb,
		stepLabel,
		mode,
		modePrompt,
		animKey,
		children
	}: {
		title: string;
		phaseBlurb?: string;
		stepLabel: string;
		mode?: 'scouting' | 'bound' | null;
		modePrompt?: string;
		animKey: string | number;
		children: Snippet;
	} = $props();
</script>

<section class="shell">
	<header class="head">
		<h2>{title}</h2>
		{#if phaseBlurb}
			<p class="phase-blurb">{phaseBlurb}</p>
		{/if}
	</header>

	<div class="body">
		<div class="question-block">
			<p class="step-label">{stepLabel}</p>

			<div class="canvas">
				{#if mode && modePrompt}
					<p class="mode" class:scouting={mode === 'scouting'} class:bound={mode === 'bound'}>
						<span class="mode-name">{mode === 'scouting' ? 'Scouting' : 'Bound'}</span>
						{modePrompt}
					</p>
				{:else}
					<div class="mode-spacer" aria-hidden="true"></div>
				{/if}

				<div class="stage">
					{#key animKey}
						<div
							class="pane"
							in:fly={{ x: 28, duration: 320, opacity: 0 }}
							out:fly={{ x: -22, duration: 200, opacity: 0 }}
						>
							{@render children()}
						</div>
					{/key}
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.shell {
		width: 100%;
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.head {
		flex-shrink: 0;
		margin-top: 0.25rem;
		margin-bottom: 1.25rem;
	}

	.head h2 {
		margin: 0 0 0.35rem;
		font-family: 'Fraunces', Georgia, serif;
		font-size: clamp(1.35rem, 3vw, 1.65rem);
	}

	.phase-blurb {
		margin: 0;
		font-size: 0.95rem;
		color: var(--text);
		line-height: 1.45;
		max-width: 36rem;
	}

	.body {
		flex: 1;
		display: grid;
		grid-template-rows: 1fr auto 2fr;
		min-height: 0;
		width: 100%;
	}

	.question-block {
		grid-row: 2;
		width: 100%;
	}

	.step-label {
		margin: 0 0 0.85rem;
		font-size: 0.95rem;
		color: var(--muted);
	}

	.canvas {
		display: flex;
		flex-direction: column;
		min-height: clamp(20rem, 42vh, 26rem);
	}

	.mode,
	.mode-spacer {
		flex-shrink: 0;
		min-height: 4.75rem;
		margin: 0;
	}

	.mode {
		padding: 0.75rem 0.9rem;
		border-left: 3px solid var(--accent);
		border-radius: 0 8px 8px 0;
		background: var(--surface);
		font-size: 0.92rem;
		color: var(--muted);
		line-height: 1.45;
	}

	.mode.scouting {
		border-left-color: var(--scouting);
	}

	.mode.bound {
		border-left-color: var(--bound);
	}

	.mode-name {
		display: block;
		font-weight: 600;
		color: var(--text);
		margin-bottom: 0.2rem;
	}

	.stage {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		position: relative;
	}

	.pane {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		width: 100%;
	}

	.pane :global(.likert) {
		flex: 1;
		min-height: 0;
	}

	.pane :global(.likert-stack) {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
</style>
