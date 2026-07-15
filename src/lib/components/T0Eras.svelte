<script lang="ts">
	import LikertQuestion from './LikertQuestion.svelte';
	import ModeBlock from './ModeBlock.svelte';
	import { quickVibeQuestions } from '$lib/questions';
	import { isComplete } from '$lib/scoring';
	import {
		addEra,
		advanceFrom,
		removeEra,
		setEraAnswer,
		setEraShadow,
		updateEraName,
		type Era
	} from '$lib/store';
	import type { LikertValue } from '$lib/types';

	let { eras }: { eras: Era[] } = $props();

	const canContinue = $derived(
		eras.length >= 1 &&
			eras.every(
				(e) =>
					e.name.trim().length > 0 &&
					isComplete(e.scouting, quickVibeQuestions) &&
					isComplete(e.bound, quickVibeQuestions)
			)
	);

	function continueT0() {
		if (!canContinue) return;
		advanceFrom('t0');
	}
</script>

<section class="t0">
	<h2>T0 — The Storyline</h2>
	<p class="lede">
		Name up to 4 past eras of your relational life, then give each a quick vibe check in both
		Scouting and Bound modes.
	</p>

	{#each eras as era, index (era.id)}
		<article class="era">
			<header class="era-head">
				<label>
					<span>Era {index + 1} name</span>
					<input
						type="text"
						placeholder={'e.g. "The College Years"'}
						value={era.name}
						oninput={(e) => updateEraName(era.id, e.currentTarget.value)}
					/>
				</label>
				{#if eras.length > 1}
					<button type="button" class="ghost" onclick={() => removeEra(era.id)}>
						Remove
					</button>
				{/if}
			</header>

			<ModeBlock mode="scouting">
				{#each quickVibeQuestions as q}
					<LikertQuestion
						id={`${era.id}-scouting-${q.id}`}
						text={q.text}
						value={era.scouting[q.id]}
						onchange={(v: LikertValue) => setEraAnswer(era.id, 'scouting', q.id, v)}
					/>
				{/each}
			</ModeBlock>

			<ModeBlock mode="bound">
				{#each quickVibeQuestions as q}
					<LikertQuestion
						id={`${era.id}-bound-${q.id}`}
						text={q.text}
						value={era.bound[q.id]}
						onchange={(v: LikertValue) => setEraAnswer(era.id, 'bound', q.id, v)}
					/>
				{/each}
				<label class="shadow">
					<input
						type="checkbox"
						checked={era.shadow}
						onchange={(e) => setEraShadow(era.id, e.currentTarget.checked)}
					/>
					<span
						>Shadow tag — Did you secretly operate outside the agreements (cheating)?</span
					>
				</label>
			</ModeBlock>
		</article>
	{/each}

	<div class="actions">
		{#if eras.length < 4}
			<button type="button" class="secondary" onclick={addEra}>Add another era</button>
		{/if}
		<button type="button" disabled={!canContinue} onclick={continueT0}>
			Continue to Present
		</button>
	</div>
</section>

<style>
	.t0 h2 {
		margin: 0 0 0.5rem;
	}

	.lede {
		color: var(--muted);
		margin: 0 0 1.5rem;
		max-width: 40rem;
	}

	.era {
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.era-head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.era-head label {
		flex: 1 1 16rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.9rem;
	}

	input[type='text'] {
		padding: 0.55rem 0.7rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		font-size: 1rem;
		background: var(--surface);
		color: var(--text);
	}

	.shadow {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		margin-top: 0.75rem;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.shadow input {
		margin-top: 0.2rem;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	button {
		padding: 0.65rem 1.25rem;
		border: none;
		border-radius: 6px;
		background: var(--accent);
		color: #fff;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
	}

	button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	button.secondary {
		background: transparent;
		color: var(--text);
		border: 1px solid var(--border);
	}

	button.ghost {
		background: transparent;
		color: var(--danger);
		font-weight: 500;
		padding: 0.4rem 0.6rem;
		font-size: 0.85rem;
	}
</style>
