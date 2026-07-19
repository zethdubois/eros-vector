<script lang="ts">
	import LikertQuestion from './LikertQuestion.svelte';
	import QuestionShell from './QuestionShell.svelte';
	import { FUTURE_BOUND_PROMPT, PHASE_BLURBS } from '$lib/questions';
	import { orderedDeepDive } from '$lib/shuffle';
	import { afterSelect } from '$lib/surveyAdvance';
	import { finishPhase, setHorizonAnswer } from '$lib/store';
	import { AXIS_META } from '$lib/labels';
	import type { Answers, LikertValue, Question } from '$lib/types';

	let {
		horizon,
		questionSeed,
		questions: bank,
		isDeveloper = false
	}: {
		horizon: Answers;
		questionSeed: number;
		questions: Question[];
		isDeveloper?: boolean;
	} = $props();

	const questions = $derived(orderedDeepDive(bank, questionSeed));

	function firstOpen(): number {
		const i = questions.findIndex((q) => horizon[q.id] === undefined);
		return i === -1 ? questions.length - 1 : i;
	}

	let stepIndex = $state(0);
	let locked = $state(false);
	let started = $state(false);
	let highWaterMark = $state(0);

	$effect(() => {
		if (!started) {
			stepIndex = firstOpen();
			highWaterMark = stepIndex;
			started = true;
		}
	});

	$effect(() => {
		if (stepIndex > highWaterMark) highWaterMark = stepIndex;
	});

	const q = $derived(questions[stepIndex]);
	const canBack = $derived(stepIndex > 0);
	const canForward = $derived(stepIndex < highWaterMark);
	const axisBadge = $derived(
		isDeveloper ? { ...AXIS_META[q.axis], label: q.axis.toUpperCase() } : undefined
	);

	function goBack() {
		if (locked || !canBack) return;
		stepIndex -= 1;
		locked = false;
	}

	function goForward() {
		if (locked || !canForward) return;
		stepIndex += 1;
		locked = false;
	}

	function onAnswer(v: LikertValue) {
		if (locked) return;
		locked = true;
		setHorizonAnswer(q.id, v);
		afterSelect(() => {
			if (stepIndex >= questions.length - 1) {
				finishPhase('t3');
				return;
			}
			stepIndex += 1;
			locked = false;
		});
	}
</script>

<QuestionShell
	title="Horizon"
	phaseBlurb={PHASE_BLURBS.t3}
	stepLabel={`Question ${stepIndex + 1} of ${questions.length}`}
	mode="bound"
	modePrompt={FUTURE_BOUND_PROMPT}
	onBack={canBack ? goBack : undefined}
	backDisabled={locked}
	onForward={canForward ? goForward : undefined}
	forwardDisabled={locked}
	{axisBadge}
	animKey={q.id}
>
	<LikertQuestion
		id={`t3-${q.id}`}
		text={q.text}
		value={horizon[q.id]}
		disabled={locked}
		onchange={onAnswer}
	/>
</QuestionShell>
