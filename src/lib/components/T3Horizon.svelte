<script lang="ts">
	import LikertQuestion from './LikertQuestion.svelte';
	import QuestionShell from './QuestionShell.svelte';
	import { MODE_PROMPTS, PHASE_BLURBS } from '$lib/questions';
	import { orderedDeepDive } from '$lib/shuffle';
	import { afterSelect } from '$lib/surveyAdvance';
	import { finishPhase, setHorizonAnswer } from '$lib/store';
	import type { Answers, LikertValue } from '$lib/types';

	let {
		horizon,
		questionSeed
	}: {
		horizon: Answers;
		questionSeed: number;
	} = $props();

	const questions = $derived(orderedDeepDive(questionSeed));

	function firstOpen(): number {
		const i = questions.findIndex((q) => horizon[q.id] === undefined);
		return i === -1 ? questions.length - 1 : i;
	}

	let stepIndex = $state(0);
	let locked = $state(false);
	let started = $state(false);

	$effect(() => {
		if (!started) {
			stepIndex = firstOpen();
			started = true;
		}
	});

	const q = $derived(questions[stepIndex]);
	const canBack = $derived(stepIndex > 0);

	function goBack() {
		if (locked || !canBack) return;
		stepIndex -= 1;
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
	modePrompt={MODE_PROMPTS.bound}
	onBack={canBack ? goBack : undefined}
	backDisabled={locked}
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
