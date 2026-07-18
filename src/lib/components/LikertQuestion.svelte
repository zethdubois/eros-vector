<script lang="ts">
	import { LIKERT_LABELS } from '$lib/questions';
	import type { LikertValue } from '$lib/types';

	let {
		id,
		text,
		value = undefined,
		disabled = false,
		onchange
	}: {
		id: string;
		text: string;
		value?: LikertValue;
		disabled?: boolean;
		onchange: (v: LikertValue) => void;
	} = $props();

	const options: LikertValue[] = [1, 2, 3, 4, 5];
</script>

<fieldset class="likert" class:disabled aria-labelledby="{id}-prompt">
	<div class="prompt-zone">
		<p id="{id}-prompt" class="prompt">{text}</p>
	</div>
	<div class="options" role="radiogroup" aria-disabled={disabled}>
		{#each options as opt}
			<label class="opt" class:selected={value === opt}>
				<input
					type="radio"
					name={id}
					value={opt}
					checked={value === opt}
					{disabled}
					onchange={() => onchange(opt)}
				/>
				<span class="num">{opt}</span>
				<span class="label">{LIKERT_LABELS[opt]}</span>
			</label>
		{/each}
	</div>
</fieldset>

<style>
	.likert {
		border: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
	}

	.likert.disabled {
		opacity: 0.7;
		pointer-events: none;
	}

	.prompt-zone {
		flex: 1;
		display: flex;
		align-items: center;
		min-height: 0;
		padding-bottom: 1.5rem;
	}

	.prompt {
		margin: 0;
		font-size: clamp(1.05rem, 2.4vw, 1.4rem);
		font-weight: 500;
		line-height: 1.5;
		max-width: 40rem;
	}

	.options {
		flex-shrink: 0;
		display: flex;
		flex-wrap: nowrap;
		align-items: stretch;
		gap: 0.35rem;
	}

	@media (min-width: 480px) {
		.options {
			gap: 0.6rem;
		}
	}

	.opt {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		flex: 1 1 0;
		min-width: 0;
		padding: 0.7rem 0.35rem;
		border: 1px solid var(--border);
		border-radius: 8px;
		cursor: pointer;
		background: var(--surface);
		font-size: 0.72rem;
		text-align: center;
		color: var(--muted);
		transition:
			border-color 0.15s ease,
			background 0.15s ease,
			transform 0.15s ease;
	}

	@media (min-width: 480px) {
		.opt {
			min-width: 5.5rem;
			padding: 0.85rem 0.55rem;
			font-size: 0.82rem;
		}
	}

	@media (min-width: 700px) {
		.opt {
			min-width: 7.28rem;
			padding: 0.85rem 0.73rem;
		}
	}

	.opt:hover {
		border-color: var(--accent);
		transform: translateY(-1px);
	}

	@media (hover: none) {
		.opt:hover {
			transform: none;
		}
	}

	.opt.selected {
		border-color: var(--accent);
		background: var(--accent-soft);
		color: var(--text);
	}

	.opt input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.num {
		font-size: 1.15rem;
		font-weight: 600;
		color: var(--text);
	}

	@media (min-width: 480px) {
		.num {
			font-size: 1.25rem;
		}
	}

	.label {
		white-space: normal;
		line-height: 1.2;
		hyphens: auto;
	}

	@media (min-width: 700px) {
		.label {
			white-space: nowrap;
		}
	}
</style>
