<script lang="ts">
	import LikertQuestion from './LikertQuestion.svelte';
	import ModeBlock from './ModeBlock.svelte';
	import { deepDiveQuestions } from '$lib/questions';
	import { isComplete } from '$lib/scoring';
	import {
		advanceFrom,
		setPresentAnswer,
		setPresentShadow,
		type DualModeAnswers
	} from '$lib/store';
	import type { LikertValue } from '$lib/types';

	let { present }: { present: DualModeAnswers } = $props();

	const canContinue = $derived(
		isComplete(present.scouting, deepDiveQuestions) &&
			isComplete(present.bound, deepDiveQuestions)
	);

	function continueT1() {
		if (!canContinue) return;
		advanceFrom('t1');
	}
</script>

<section class="t1">
	<h2>T1 — Present (Deep Dive)</h2>
	<p class="lede">
		Fifteen core questions on how you operate now — answered once for Scouting, once for Bound.
	</p>

	<ModeBlock mode="scouting">
		{#each deepDiveQuestions as q, i}
			<p class="qnum">Question {i + 1} of {deepDiveQuestions.length}</p>
			<LikertQuestion
				id={`t1-scouting-${q.id}`}
				text={q.text}
				value={present.scouting[q.id]}
				onchange={(v: LikertValue) => setPresentAnswer('scouting', q.id, v)}
			/>
		{/each}
	</ModeBlock>

	<ModeBlock mode="bound">
		{#each deepDiveQuestions as q, i}
			<p class="qnum">Question {i + 1} of {deepDiveQuestions.length}</p>
			<LikertQuestion
				id={`t1-bound-${q.id}`}
				text={q.text}
				value={present.bound[q.id]}
				onchange={(v: LikertValue) => setPresentAnswer('bound', q.id, v)}
			/>
		{/each}
		<label class="shadow">
			<input
				type="checkbox"
				checked={present.shadow}
				onchange={(e) => setPresentShadow(e.currentTarget.checked)}
			/>
			<span>Shadow tag — Did you secretly operate outside the agreements (cheating)?</span>
		</label>
	</ModeBlock>

	<button type="button" disabled={!canContinue} onclick={continueT1}>Continue</button>
</section>

<style>
	.t1 h2 {
		margin: 0 0 0.5rem;
	}

	.lede {
		color: var(--muted);
		margin: 0 0 1.5rem;
		max-width: 40rem;
	}

	.qnum {
		margin: 0 0 0.35rem;
		font-size: 0.8rem;
		color: var(--muted);
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

	button {
		margin-top: 1rem;
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
</style>
