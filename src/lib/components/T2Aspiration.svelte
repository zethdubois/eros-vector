<script lang="ts">
	import LikertQuestion from './LikertQuestion.svelte';
	import { deepDiveQuestions } from '$lib/questions';
	import { isComplete } from '$lib/scoring';
	import { advanceFrom, setAspirationAnswer } from '$lib/store';
	import type { Answers, LikertValue } from '$lib/types';

	let {
		aspiration,
		finalForm
	}: {
		aspiration: Answers;
		finalForm: boolean;
	} = $props();

	const title = $derived(finalForm ? 'Final Form (T2 + T3 merged)' : 'T2 — Aspiration (Deep Dive)');
	const lede = $derived(
		finalForm
			? 'At 55+, Aspiration and Horizon merge into one Bound pass — your Final Form architecture.'
			: 'Fifteen core questions on the relational architecture you want to build (Bound framing).'
	);
	const buttonLabel = $derived(finalForm ? 'See results' : 'Continue to Horizon');

	const canContinue = $derived(isComplete(aspiration, deepDiveQuestions));

	function continueT2() {
		if (!canContinue) return;
		advanceFrom('t2');
	}
</script>

<section class="t2">
	<h2>{title}</h2>
	<p class="lede">{lede}</p>
	<p class="mode-note">Bound Mode — aspirational architecture is inherently Bound.</p>

	{#each deepDiveQuestions as q, i}
		<p class="qnum">Question {i + 1} of {deepDiveQuestions.length}</p>
		<LikertQuestion
			id={`t2-${q.id}`}
			text={q.text}
			value={aspiration[q.id]}
			onchange={(v: LikertValue) => setAspirationAnswer(q.id, v)}
		/>
	{/each}

	<button type="button" disabled={!canContinue} onclick={continueT2}>{buttonLabel}</button>
</section>

<style>
	.t2 h2 {
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
