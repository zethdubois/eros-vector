<script lang="ts">
	import { LIKERT_LABELS } from '$lib/questions';
	import type { LikertValue } from '$lib/types';

	let {
		id,
		text,
		value = undefined,
		onchange
	}: {
		id: string;
		text: string;
		value?: LikertValue;
		onchange: (v: LikertValue) => void;
	} = $props();

	const options: LikertValue[] = [1, 2, 3, 4, 5];
</script>

<fieldset class="likert">
	<legend class="prompt">{text}</legend>
	<div class="options" role="radiogroup">
		{#each options as opt}
			<label class="opt" class:selected={value === opt}>
				<input
					type="radio"
					name={id}
					value={opt}
					checked={value === opt}
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
		margin: 0 0 1.25rem;
	}

	.prompt {
		font-size: 1.05rem;
		font-weight: 500;
		line-height: 1.45;
		margin-bottom: 0.75rem;
		padding: 0;
	}

	.options {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.opt {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		flex: 1 1 4.5rem;
		min-width: 4.5rem;
		padding: 0.6rem 0.4rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		cursor: pointer;
		background: var(--surface);
		font-size: 0.7rem;
		text-align: center;
		color: var(--muted);
	}

	.opt:hover {
		border-color: var(--accent);
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
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text);
	}
</style>
