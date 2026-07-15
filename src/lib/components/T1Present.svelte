<script lang="ts">
	import LikertQuestion from './LikertQuestion.svelte';
	import QuestionShell from './QuestionShell.svelte';
	import { MODE_PROMPTS, PHASE_BLURBS } from '$lib/questions';
	import { orderedDeepDive } from '$lib/shuffle';
	import { afterSelect } from '$lib/surveyAdvance';
	import {
		advanceFrom,
		setPresentAnswer,
		setPresentShadow,
		type DualModeAnswers
	} from '$lib/store';
	import type { LikertValue } from '$lib/types';

	let {
		present,
		questionSeed
	}: {
		present: DualModeAnswers;
		questionSeed: number;
	} = $props();

	const questions = $derived(orderedDeepDive(questionSeed));

	type Step =
		| { kind: 'q'; mode: 'scouting' | 'bound'; qi: number }
		| { kind: 'shadow' };

	const steps = $derived.by((): Step[] => [
		...questions.map((_, qi) => ({ kind: 'q' as const, mode: 'scouting' as const, qi })),
		...questions.map((_, qi) => ({ kind: 'q' as const, mode: 'bound' as const, qi })),
		{ kind: 'shadow' }
	]);

	function firstOpenStep(): number {
		for (let i = 0; i < steps.length; i++) {
			const s = steps[i];
			if (s.kind === 'q') {
				const q = questions[s.qi];
				if (present[s.mode][q.id] === undefined) return i;
			} else {
				return i;
			}
		}
		return steps.length - 1;
	}

	let stepIndex = $state(0);
	let locked = $state(false);
	let started = $state(false);

	$effect(() => {
		if (!started) {
			stepIndex = firstOpenStep();
			started = true;
		}
	});

	const step = $derived(steps[stepIndex]);
	const totalQ = $derived(questions.length * 2);
	const stepLabel = $derived(
		step.kind === 'q'
			? `Question ${step.qi + 1 + (step.mode === 'bound' ? questions.length : 0)} of ${totalQ}`
			: `Wrap-up · Bound`
	);

	function goNext() {
		if (stepIndex >= steps.length - 1) {
			advanceFrom('t1');
			return;
		}
		stepIndex += 1;
		locked = false;
	}

	function onAnswer(v: LikertValue) {
		if (locked || step.kind !== 'q') return;
		locked = true;
		const q = questions[step.qi];
		setPresentAnswer(step.mode, q.id, v);
		afterSelect(() => {
			goNext();
		});
	}

	function onShadow(value: boolean) {
		if (locked || step.kind !== 'shadow') return;
		locked = true;
		setPresentShadow(value);
		afterSelect(() => {
			advanceFrom('t1');
		});
	}
</script>

{#if step.kind === 'q'}
	{@const q = questions[step.qi]}
	<QuestionShell
		title="T1 — Present"
		phaseBlurb={PHASE_BLURBS.t1}
		{stepLabel}
		mode={step.mode}
		modePrompt={MODE_PROMPTS[step.mode]}
		animKey={`${step.mode}-${q.id}`}
	>
		<LikertQuestion
			id={`t1-${step.mode}-${q.id}`}
			text={q.text}
			value={present[step.mode][q.id]}
			disabled={locked}
			onchange={onAnswer}
		/>
	</QuestionShell>
{:else}
	<QuestionShell
		title="T1 — Present"
		phaseBlurb={PHASE_BLURBS.t1}
		{stepLabel}
		mode="bound"
		modePrompt={MODE_PROMPTS.bound}
		animKey="shadow"
	>
		<div class="choice">
			<p class="prompt">
				Shadow tag — Did you secretly operate outside the agreements (cheating)?
			</p>
			<div class="btns">
				<button type="button" class="secondary" disabled={locked} onclick={() => onShadow(false)}
					>No</button
				>
				<button type="button" disabled={locked} onclick={() => onShadow(true)}>Yes</button>
			</div>
		</div>
	</QuestionShell>
{/if}

<style>
	.choice .prompt {
		margin: 0 0 1.25rem;
		font-size: clamp(1.2rem, 2.4vw, 1.4rem);
		font-weight: 500;
		line-height: 1.5;
		max-width: 36rem;
	}

	.btns {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	button {
		padding: 0.75rem 1.4rem;
		border: none;
		border-radius: 8px;
		background: var(--accent);
		color: #fff;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
	}

	button.secondary {
		background: var(--surface);
		color: var(--text);
		border: 1px solid var(--border);
	}

	button:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}
</style>
