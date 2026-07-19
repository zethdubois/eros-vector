<script lang="ts">
	import LikertQuestion from './LikertQuestion.svelte';
	import QuestionShell from './QuestionShell.svelte';
	import { MODE_PROMPTS, PHASE_BLURBS } from '$lib/questions';
	import { orderedDeepDive } from '$lib/shuffle';
	import { afterSelect } from '$lib/surveyAdvance';
	import { finishPhase, setPresentAnswer, setPresentShadow, type DualModeAnswers } from '$lib/store';
	import { AXIS_META } from '$lib/labels';
	import { SETTINGS } from '$lib/settings';
	import type { LikertValue, Question } from '$lib/types';

	let {
		present,
		questionSeed,
		questions: bank,
		isDeveloper = false
	}: {
		present: DualModeAnswers;
		questionSeed: number;
		questions: Question[];
		isDeveloper?: boolean;
	} = $props();

	const questions = $derived(orderedDeepDive(bank, questionSeed));

	type OpenStep =
		| { kind: 'q'; qi: number; mode: 'scouting' | 'bound' }
		| { kind: 'shadow' };

	function firstOpen(): OpenStep {
		for (let qi = 0; qi < questions.length; qi++) {
			const q = questions[qi];
			if (!SETTINGS.scoutingDisabled && present.scouting[q.id] === undefined) {
				return { kind: 'q', qi, mode: 'scouting' };
			}
			if (present.bound[q.id] === undefined) {
				return { kind: 'q', qi, mode: 'bound' };
			}
		}
		return { kind: 'shadow' };
	}

	/** Default mode: 'bound' when scouting is disabled, otherwise 'scouting'. */
	const defaultMode = SETTINGS.scoutingDisabled ? 'bound' : 'scouting';

	let questionIndex = $state(0);
	let mode = $state<'scouting' | 'bound'>(defaultMode);
	let showShadow = $state(false);
	let locked = $state(false);
	let started = $state(false);
	let highWaterQuestion = $state(0);

	$effect(() => {
		if (!started) {
			const open = firstOpen();
			if (open.kind === 'shadow') {
				showShadow = true;
				highWaterQuestion = questions.length;
			} else {
				questionIndex = open.qi;
				mode = open.mode;
				highWaterQuestion = open.qi;
			}
			started = true;
		}
	});

	$effect(() => {
		const mark = showShadow ? questions.length : questionIndex;
		if (mark > highWaterQuestion) highWaterQuestion = mark;
	});

	const q = $derived(questions[questionIndex]);
	const canBack = $derived(showShadow || questionIndex > 0);
	const canForward = $derived(!showShadow && questionIndex < highWaterQuestion);
	const stepLabel = $derived(
		showShadow
			? 'Wrap-up · Bound'
			: `Question ${questionIndex + 1} of ${questions.length} · ${mode === 'scouting' ? 'Scouting' : 'Bound'}`
	);
	const axisBadge = $derived(
		!showShadow && isDeveloper
			? { label: AXIS_META[q.axis].label, domain: AXIS_META[q.axis].domain, color: AXIS_META[q.axis].color }
			: undefined
	);

	function onModeChange(next: 'scouting' | 'bound') {
		if (locked || showShadow || SETTINGS.scoutingDisabled) return;
		mode = next;
	}

	function goBack() {
		if (locked || !canBack) return;
		locked = false;
		if (showShadow) {
			showShadow = false;
			questionIndex = questions.length - 1;
			mode = defaultMode;
			return;
		}
		if (questionIndex > 0) {
			questionIndex -= 1;
			mode = defaultMode;
		}
	}

	function goForward() {
		if (locked || !canForward) return;
		if (questionIndex < questions.length - 1) {
			questionIndex += 1;
			mode = defaultMode;
		} else {
			showShadow = true;
		}
	}

	function onAnswer(v: LikertValue) {
		if (locked || showShadow) return;
		locked = true;
		setPresentAnswer(mode, q.id, v);
		afterSelect(() => {
			if (!SETTINGS.scoutingDisabled && mode === 'scouting') {
				mode = 'bound';
				locked = false;
				return;
			}

			if (questionIndex >= questions.length - 1) {
				showShadow = true;
			} else {
				questionIndex += 1;
				mode = defaultMode;
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
		phaseNote="Answer this section of the survey based on how your intimate life works <em>now</em>.<br>In the Aspirational section, you will answer the same questions with a focus on how you want your intimate life to evolve next!"
		{stepLabel}
		{mode}
		modeSlider={!SETTINGS.scoutingDisabled}
		modeSliderDisabled={locked}
		modePrompt={SETTINGS.scoutingDisabled ? MODE_PROMPTS.bound : undefined}
		onModeChange={!SETTINGS.scoutingDisabled ? onModeChange : undefined}
		scoutingBadge={SETTINGS.scoutingDisabled}
		{axisBadge}
		onBack={canBack ? goBack : undefined}
		backDisabled={locked}
		onForward={canForward ? goForward : undefined}
		forwardDisabled={locked}
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
