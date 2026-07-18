<script lang="ts">
	import LikertQuestion from './LikertQuestion.svelte';
	import QuestionShell from './QuestionShell.svelte';
	import { MODE_PROMPTS, PHASE_BLURBS } from '$lib/questions';
	import { orderedDeepDive } from '$lib/shuffle';
	import { afterSelect } from '$lib/surveyAdvance';
	import { finishPhase, setAspirationAnswer } from '$lib/store';
	import type { Answers, LikertValue, Question } from '$lib/types';

	let {
		aspiration,
		finalForm,
		questionSeed,
		questions: bank
	}: {
		aspiration: Answers;
		finalForm: boolean;
		questionSeed: number;
		questions: Question[];
	} = $props();

	const questions = $derived(orderedDeepDive(bank, questionSeed));
	const title = $derived(finalForm ? 'Final Form' : 'Aspiration');
	const phaseBlurb = $derived(finalForm ? PHASE_BLURBS.finalForm : PHASE_BLURBS.t2);

	function firstOpen(): number {
		const i = questions.findIndex((q) => aspiration[q.id] === undefined);
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
		setAspirationAnswer(q.id, v);
		afterSelect(() => {
			if (stepIndex >= questions.length - 1) {
				finishPhase('t2');
				return;
			}
			stepIndex += 1;
			locked = false;
		});
	}
</script>

<QuestionShell
	{title}
	{phaseBlurb}
	stepLabel={`Question ${stepIndex + 1} of ${questions.length}`}
	mode="bound"
	modePrompt={MODE_PROMPTS.bound}
	onBack={canBack ? goBack : undefined}
	backDisabled={locked}
	animKey={q.id}
>
	<LikertQuestion
		id={`t2-${q.id}`}
		text={q.text}
		value={aspiration[q.id]}
		disabled={locked}
		onchange={onAnswer}
	/>
</QuestionShell>
