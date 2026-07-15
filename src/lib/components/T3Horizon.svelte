<script lang="ts">
	import LikertQuestion from './LikertQuestion.svelte';
	import { deepDiveQuestions } from '$lib/questions';
	import { isComplete } from '$lib/scoring';
	import { advanceFrom, setHorizonAnswer } from '$lib/store';
	import type { Answers, LikertValue } from '$lib/types';

	let { horizon }: { horizon: Answers } = $props();

	const canContinue = $derived(isComplete(horizon, deepDiveQuestions));

	function continueT3() {
		if (!canContinue) return;
		advanceFrom('t3');
	}
</script>

<section class="t3">
	<h2>T3 — Horizon (Deep Dive)</h2>
	<p class="lede">
		Fifteen core questions on your long-range relational horizon (Bound framing).
	</p>
	<p class="mode-note">Bound Mode — horizon architecture is inherently Bound.</p>

	{#each deepDiveQuestions as q, i}
		<p class="qnum">Question {i + 1} of {deepDiveQuestions.length}</p>
		<LikertQuestion
			id={`t3-${q.id}`}
			text={q.text}
			value={horizon[q.id]}
			onchange={(v: LikertValue) => setHorizonAnswer(q.id, v)}
		/>
	{/each}

	<button type="button" disabled={!canContinue} onclick={continueT3}>See results</button>
</section>

<style>
	.t3 h2 {
		margin: 0 0 0.5rem;
	}

	.lede {
		color: var(--muted);
		margin: 0 0 0.75rem;
		max-width: 40rem;
	}

	.mode-note {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--bound);
		margin: 0 0 1.5rem;
	}

	.qnum {
		margin: 0 0 0.35rem;
		font-size: 0.8rem;
		color: var(--muted);
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
