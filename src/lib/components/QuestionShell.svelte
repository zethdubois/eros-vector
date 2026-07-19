<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { Snippet } from 'svelte';
	import ModeSlider from './ModeSlider.svelte';

	let {
		title,
		phaseBlurb,
		stepLabel,
		mode,
		modePrompt,
		modeSlider = false,
		modeSliderDisabled = false,
		onModeChange,
		onBack,
		backDisabled = false,
		onForward,
		forwardDisabled = false,
		animKey,
		children
	}: {
		title: string;
		phaseBlurb?: string;
		stepLabel: string;
		mode?: 'scouting' | 'bound' | null;
		modePrompt?: string;
		modeSlider?: boolean;
		modeSliderDisabled?: boolean;
		onModeChange?: (mode: 'scouting' | 'bound') => void;
		onBack?: () => void;
		backDisabled?: boolean;
		onForward?: () => void;
		forwardDisabled?: boolean;
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
			<div class="step-row">
				<p class="step-label">{stepLabel}</p>
				<div class="nav-btns">
					{#if onBack}
						<button type="button" class="nav-btn" disabled={backDisabled} onclick={onBack}>
							← Back
						</button>
					{/if}
					{#if onForward}
						<button type="button" class="nav-btn" disabled={forwardDisabled} onclick={onForward}>
							Forward →
						</button>
					{/if}
				</div>
			</div>

			<div
				class="canvas"
				class:mode-scouting={modeSlider && mode === 'scouting'}
				class:mode-bound={modeSlider && mode === 'bound'}
			>
				{#if modeSlider && mode}
					<ModeSlider {mode} disabled={modeSliderDisabled} onchange={onModeChange} />
				{:else if mode && modePrompt}
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

	.step-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.85rem;
	}

	.step-label {
		margin: 0;
		font-size: 0.95rem;
		color: var(--muted);
	}

	.nav-btns {
		display: flex;
		gap: 0.4rem;
	}

	.nav-btn {
		flex-shrink: 0;
		padding: 0.35rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		color: var(--text);
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
	}

	.nav-btn:hover:not(:disabled) {
		border-color: var(--accent);
		color: var(--accent);
	}

	.nav-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.canvas {
		display: flex;
		flex-direction: column;
		min-height: clamp(16rem, 38dvh, 26rem);
		border-radius: 14px;
		transition:
			background 0.35s ease,
			padding 0.2s ease;
	}

	.canvas.mode-scouting,
	.canvas.mode-bound {
		padding: 0.85rem 0.75rem 1rem;
	}

	@media (min-width: 700px) {
		.canvas.mode-scouting,
		.canvas.mode-bound {
			padding: 1.1rem 1.15rem 1.25rem;
		}
	}

	.canvas.mode-scouting {
		background: color-mix(in srgb, var(--scouting) 5%, transparent);
	}

	.canvas.mode-bound {
		background: color-mix(in srgb, var(--bound) 6%, transparent);
	}

	.mode,
	.mode-spacer {
		flex-shrink: 0;
		min-height: 3.5rem;
		margin: 0 0 1.25rem;
	}

	:global(.mode-slider) {
		margin-bottom: 1.25rem;
	}

	@media (min-width: 700px) {
		.mode,
		.mode-spacer {
			min-height: 4.75rem;
			margin: 0 0 2.5rem;
		}

		:global(.mode-slider) {
			margin-bottom: 2.5rem;
		}
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
