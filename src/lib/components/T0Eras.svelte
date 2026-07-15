<script lang="ts">
	import LikertQuestion from './LikertQuestion.svelte';
	import QuestionShell from './QuestionShell.svelte';
	import { MODE_PROMPTS, PHASE_BLURBS } from '$lib/questions';
	import { orderedQuickVibe } from '$lib/shuffle';
	import { afterSelect } from '$lib/surveyAdvance';
	import {
		addEra,
		advanceFrom,
		setEraAnswer,
		setEraShadow,
		updateEraName,
		type Era
	} from '$lib/store';
	import type { LikertValue, Question } from '$lib/types';

	let {
		eras,
		questionSeed
	}: {
		eras: Era[];
		questionSeed: number;
	} = $props();

	const questions = $derived(orderedQuickVibe(questionSeed));

	type Step =
		| { kind: 'name'; eraIndex: number }
		| { kind: 'q'; eraIndex: number; mode: 'scouting' | 'bound'; qi: number }
		| { kind: 'shadow'; eraIndex: number }
		| { kind: 'gate' };

	function buildSteps(list: Era[], bank: Question[]): Step[] {
		const out: Step[] = [];
		list.forEach((_, eraIndex) => {
			out.push({ kind: 'name', eraIndex });
			for (const mode of ['scouting', 'bound'] as const) {
				bank.forEach((_, qi) => {
					out.push({ kind: 'q', eraIndex, mode, qi });
				});
			}
			out.push({ kind: 'shadow', eraIndex });
		});
		out.push({ kind: 'gate' });
		return out;
	}

	function firstOpen(list: Era[], built: Step[], bank: Question[]): number {
		for (let i = 0; i < built.length; i++) {
			const s = built[i];
			if (s.kind === 'name') {
				if (!list[s.eraIndex]?.name.trim()) return i;
			} else if (s.kind === 'q') {
				const eraItem = list[s.eraIndex];
				const q = bank[s.qi];
				if (eraItem && eraItem[s.mode][q.id] === undefined) return i;
			} else if (s.kind === 'shadow') {
				continue;
			} else {
				return i;
			}
		}
		return Math.max(0, built.length - 1);
	}

	let stepIndex = $state(0);
	let locked = $state(false);
	let nameDraft = $state('');
	let started = $state(false);
	let pendingNewEra = $state(false);

	const steps = $derived(buildSteps(eras, questions));
	const step = $derived(steps[Math.min(stepIndex, steps.length - 1)]);
	const era = $derived(
		step.kind !== 'gate' ? eras[step.eraIndex] : eras[eras.length - 1]
	);

	$effect(() => {
		if (!started && eras.length) {
			stepIndex = firstOpen(eras, buildSteps(eras, questions), questions);
			started = true;
		}
	});

	$effect(() => {
		if (pendingNewEra && eras.length) {
			const built = buildSteps(eras, questions);
			const idx = built.findIndex(
				(s) => s.kind === 'name' && s.eraIndex === eras.length - 1
			);
			stepIndex = idx >= 0 ? idx : built.length - 2;
			pendingNewEra = false;
			locked = false;
		}
	});

	$effect(() => {
		if (step.kind === 'name' && era) {
			nameDraft = era.name;
		}
	});

	const questionsPerEra = $derived(questions.length * 2);
	const stepLabel = $derived.by(() => {
		if (step.kind === 'gate') return 'Past eras';
		if (step.kind === 'name') return `Era ${step.eraIndex + 1} of ${eras.length} · Name`;
		if (step.kind === 'shadow') return `Era ${step.eraIndex + 1} · Bound wrap-up`;
		const offset = step.mode === 'bound' ? questions.length : 0;
		return `Era ${step.eraIndex + 1} · Question ${step.qi + 1 + offset} of ${questionsPerEra}`;
	});

	function goNext() {
		if (stepIndex >= steps.length - 1) {
			advanceFrom('t0');
			return;
		}
		stepIndex += 1;
		locked = false;
	}

	function submitName() {
		if (locked || step.kind !== 'name' || !era) return;
		const name = nameDraft.trim();
		if (!name) return;
		locked = true;
		updateEraName(era.id, name);
		afterSelect(() => {
			goNext();
		}, 180);
	}

	function onAnswer(v: LikertValue) {
		if (locked || step.kind !== 'q' || !era) return;
		locked = true;
		const q = questions[step.qi];
		setEraAnswer(era.id, step.mode, q.id, v);
		afterSelect(() => {
			goNext();
		});
	}

	function onShadow(value: boolean) {
		if (locked || step.kind !== 'shadow' || !era) return;
		locked = true;
		setEraShadow(era.id, value);
		afterSelect(() => {
			goNext();
		});
	}

	function finishEras() {
		if (locked) return;
		locked = true;
		advanceFrom('t0');
	}

	function addAnotherEra() {
		if (locked || eras.length >= 4) return;
		locked = true;
		pendingNewEra = true;
		addEra();
	}
</script>

{#if step.kind === 'name' && era}
	<QuestionShell
		title="T0 — Past eras"
		phaseBlurb={PHASE_BLURBS.t0}
		{stepLabel}
		animKey={`name-${era.id}`}
	>
		<div class="name-step">
			<label>
				<span>Name this era of your relational life</span>
				<input
					type="text"
					placeholder={'e.g. "The College Years"'}
					bind:value={nameDraft}
					disabled={locked}
					onkeydown={(e) => e.key === 'Enter' && submitName()}
				/>
			</label>
			<button type="button" disabled={locked || !nameDraft.trim()} onclick={submitName}
				>Continue</button
			>
		</div>
	</QuestionShell>
{:else if step.kind === 'q' && era}
	{@const q = questions[step.qi]}
	<QuestionShell
		title="T0 — Past eras"
		phaseBlurb={PHASE_BLURBS.t0}
		{stepLabel}
		mode={step.mode}
		modePrompt={MODE_PROMPTS[step.mode]}
		animKey={`${era.id}-${step.mode}-${q.id}`}
	>
		{#if era.name}
			<p class="era-chip">{era.name}</p>
		{/if}
		<LikertQuestion
			id={`${era.id}-${step.mode}-${q.id}`}
			text={q.text}
			value={era[step.mode][q.id]}
			disabled={locked}
			onchange={onAnswer}
		/>
	</QuestionShell>
{:else if step.kind === 'shadow' && era}
	<QuestionShell
		title="T0 — Past eras"
		phaseBlurb={PHASE_BLURBS.t0}
		{stepLabel}
		mode="bound"
		modePrompt={MODE_PROMPTS.bound}
		animKey={`shadow-${era.id}`}
	>
		{#if era.name}
			<p class="era-chip">{era.name}</p>
		{/if}
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
{:else if step.kind === 'gate'}
	<QuestionShell title="T0 — Past eras" phaseBlurb={PHASE_BLURBS.t0} {stepLabel} animKey="gate">
		<div class="gate">
			<p class="prompt">Want to map another past era? (up to 4)</p>
			<div class="btns">
				{#if eras.length < 4}
					<button type="button" class="secondary" disabled={locked} onclick={addAnotherEra}
						>Add another era</button
					>
				{/if}
				<button type="button" disabled={locked} onclick={finishEras}>Continue to Present</button>
			</div>
		</div>
	</QuestionShell>
{/if}

<style>
	.name-step label {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		margin-bottom: 1.25rem;
		font-size: 0.95rem;
	}

	input[type='text'] {
		padding: 0.7rem 0.85rem;
		border: 1px solid var(--border);
		border-radius: 8px;
		font-size: 1.05rem;
		background: var(--surface);
		color: var(--text);
		max-width: 28rem;
	}

	.era-chip {
		display: inline-block;
		margin: 0 0 0.85rem;
		padding: 0.25rem 0.65rem;
		border-radius: 6px;
		background: var(--accent-soft);
		color: var(--accent);
		font-size: 0.8rem;
		font-weight: 600;
	}

	.choice .prompt,
	.gate .prompt {
		margin: 0 0 1.25rem;
		font-size: clamp(1.1rem, 2.4vw, 1.3rem);
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
