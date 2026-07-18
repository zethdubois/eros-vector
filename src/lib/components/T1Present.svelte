<script lang="ts">
	import LikertQuestion from './LikertQuestion.svelte';
	import QuestionShell from './QuestionShell.svelte';
	import { MODE_PROMPTS, PHASE_BLURBS } from '$lib/questions';
	import { orderedDeepDive } from '$lib/shuffle';
	import { afterSelect } from '$lib/surveyAdvance';
	import { finishPhase, setPresentAnswer, setPresentShadow, type DualModeAnswers } from '$lib/store';
	import type { LikertValue, Question } from '$lib/types';

	let {
		present,
		questionSeed,
		questions: bank
	}: {
		present: DualModeAnswers;
		questionSeed: number;
		questions: Question[];
	} = $props();

	const questions = $derived(orderedDeepDive(bank, questionSeed));

	type OpenStep =
		| { kind: 'q'; qi: number; mode: 'scouting' | 'bound' }
		| { kind: 'shadow' };

	function firstOpen(): OpenStep {
		for (let qi = 0; qi < questions.length; qi++) {
			const q = questions[qi];
			if (present.scouting[q.id] === undefined) {
				return { kind: 'q', qi, mode: 'scouting' };
			}
			if (present.bound[q.id] === undefined) {
				return { kind: 'q', qi, mode: 'bound' };
			}
		}
		return { kind: 'shadow' };
	}

	let questionIndex = $state(0);
	let mode = $state<'scouting' | 'bound'>('scouting');
	let showShadow = $state(false);
	let locked = $state(false);
	let started = $state(false);

	$effect(() => {
		if (!started) {
			const open = firstOpen();
			if (open.kind === 'shadow') {
				showShadow = true;
			} else {
				questionIndex = open.qi;
				mode = open.mode;
			}
			started = true;
		}
	});

	const q = $derived(questions[questionIndex]);
	const canBack = $derived(showShadow || questionIndex > 0);
	const stepLabel = $derived(
		showShadow
			? 'Wrap-up · Bound'
			: `Question ${questionIndex + 1} of ${questions.length} · ${mode === 'scouting' ? 'Scouting' : 'Bound'}`
	);

	function onModeChange(next: 'scouting' | 'bound') {
		if (locked || showShadow) return;
		mode = next;
	}

	function goBack() {
		if (locked || !canBack) return;
		locked = false;
		if (showShadow) {
			showShadow = false;
			questionIndex = questions.length - 1;
			mode = 'scouting';
			return;
		}
		if (questionIndex > 0) {
			questionIndex -= 1;
			mode = 'scouting';
		}
	}

	function onAnswer(v: LikertValue) {
		if (locked || showShadow) return;
		locked = true;
		setPresentAnswer(mode, q.id, v);
		afterSelect(() => {
			if (mode === 'scouting') {
				mode = 'bound';
				locked = false;
				return;
			}

			if (questionIndex >= questions.length - 1) {
				showShadow = true;
			} else {
				questionIndex += 1;
				mode = 'scouting';
			}
			locked = false;
		});
	}

	function onShadow(value: boolean) {
		if (locked || !showShadow) return;
		locked = true;
		setPresentShadow(value);
		afterSelect(() => {
			finishPhase('t1');
		});
	}
</script>

{#if !showShadow}
	<QuestionShell
		title="Present"
		phaseBlurb={PHASE_BLURBS.t1}
		{stepLabel}
		{mode}
		modeSlider
		modeSliderDisabled={locked}
		onModeChange={onModeChange}
		onBack={canBack ? goBack : undefined}
		backDisabled={locked}
		animKey={q.id}
	>
		<LikertQuestion
			id={`t1-${mode}-${q.id}`}
			text={q.text}
			value={present[mode][q.id]}
			disabled={locked}
			onchange={onAnswer}
		/>
	</QuestionShell>
{:else}
	<QuestionShell
		title="Present"
		phaseBlurb={PHASE_BLURBS.t1}
		{stepLabel}
		mode="bound"
		modePrompt={MODE_PROMPTS.bound}
		onBack={goBack}
		backDisabled={locked}
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
