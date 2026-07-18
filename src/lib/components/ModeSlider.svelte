<script lang="ts">
	import { MODE_PROMPTS } from '$lib/questions';

	let {
		mode,
		disabled = false,
		onchange
	}: {
		mode: 'scouting' | 'bound';
		disabled?: boolean;
		onchange?: (mode: 'scouting' | 'bound') => void;
	} = $props();

	const prompt = $derived(MODE_PROMPTS[mode]);
</script>

<div
	class="mode-slider"
	class:scouting={mode === 'scouting'}
	class:bound={mode === 'bound'}
	role="group"
	aria-label="Operating mode"
>
	<div class="track">
		<span class="thumb" aria-hidden="true"></span>
		<button
			type="button"
			class="seg"
			class:active={mode === 'scouting'}
			disabled={disabled}
			aria-pressed={mode === 'scouting'}
			onclick={() => onchange?.('scouting')}
		>
			Scouting
		</button>
		<button
			type="button"
			class="seg"
			class:active={mode === 'bound'}
			disabled={disabled}
			aria-pressed={mode === 'bound'}
			onclick={() => onchange?.('bound')}
		>
			Bound
		</button>
	</div>
	<p class="prompt">{prompt}</p>
</div>

<style>
	.mode-slider {
		flex-shrink: 0;
		margin: 0 0 1.25rem;
		padding: 0.75rem 0.7rem 0.85rem;
		border-radius: 12px;
		border: 2px solid transparent;
		transition:
			background 0.35s ease,
			border-color 0.35s ease,
			box-shadow 0.35s ease;
	}

	@media (min-width: 700px) {
		.mode-slider {
			margin: 0 0 2.5rem;
			padding: 0.85rem 0.95rem 0.95rem;
		}
	}

	.mode-slider.scouting {
		background: color-mix(in srgb, var(--scouting) 14%, var(--surface));
		border-color: color-mix(in srgb, var(--scouting) 35%, transparent);
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--scouting) 12%, transparent);
	}

	.mode-slider.bound {
		background: color-mix(in srgb, var(--bound) 16%, var(--surface));
		border-color: color-mix(in srgb, var(--bound) 40%, transparent);
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--bound) 14%, transparent);
	}

	.track {
		position: relative;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.25rem;
		padding: 0.25rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--text) 6%, transparent);
		margin-bottom: 0.75rem;
	}

	.thumb {
		position: absolute;
		top: 0.25rem;
		left: 0.25rem;
		width: calc(50% - 0.25rem);
		height: calc(100% - 0.5rem);
		border-radius: 999px;
		background: var(--surface);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
		transition:
			transform 0.32s cubic-bezier(0.34, 1.2, 0.64, 1),
			background 0.32s ease;
		pointer-events: none;
	}

	.scouting .thumb {
		transform: translateX(0);
		background: color-mix(in srgb, var(--scouting) 18%, var(--surface));
	}

	.bound .thumb {
		transform: translateX(calc(100% + 0.25rem));
		background: color-mix(in srgb, var(--bound) 22%, var(--surface));
	}

	.seg {
		position: relative;
		z-index: 1;
		padding: 0.65rem 0.75rem;
		min-height: 2.5rem;
		border: none;
		border-radius: 999px;
		background: transparent;
		font-size: 0.82rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: var(--muted);
		cursor: pointer;
		transition: color 0.25s ease;
	}

	.seg.active {
		color: var(--text);
	}

	.scouting .seg.active {
		color: var(--scouting);
	}

	.bound .seg.active {
		color: var(--bound);
	}

	.seg:disabled {
		cursor: not-allowed;
		opacity: 0.65;
	}

	.prompt {
		margin: 0;
		font-size: 0.92rem;
		line-height: 1.45;
		color: var(--muted);
		transition: opacity 0.2s ease;
	}
</style>
