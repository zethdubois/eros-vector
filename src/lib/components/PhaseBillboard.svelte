<script lang="ts">
	import {
		continueFromPause,
		includeHorizon,
		skipHorizon,
		type SurveyState
	} from '$lib/store';
	import {
		buildBillboardLines,
		buildPartialResultSections,
		type QuestionBanks
	} from '$lib/results';
	import { SETTINGS } from '$lib/settings';

	let {
		state,
		banks
	}: {
		state: SurveyState;
		banks: QuestionBanks;
	} = $props();

	const lines = $derived.by(() => {
		const raw = buildBillboardLines(state, banks);
		if (!SETTINGS.scoutingDisabled) return raw;
		return raw
			.map((l) => ({ ...l, passes: l.passes.filter((p) => p.mode !== 'scouting') }))
			.filter((l) => l.passes.length > 0);
	});
	const showHorizonChoice = $derived(
		state.phase === 'pause-t2' && state.routing?.t3 && !state.routing.finalForm
	);
	const partialSections = $derived.by(() => {
		if (!showHorizonChoice) return [];
		const raw = buildPartialResultSections(state, banks);
		if (!SETTINGS.scoutingDisabled) return raw;
		return raw
			.map((s) => ({ ...s, passes: s.passes.filter((p) => p.mode !== 'scouting') }))
			.filter((s) => s.passes.length > 0);
	});
	const continueLabel = $derived.by(() => {
		switch (state.phase) {
			case 'pause-t0':
				return 'Continue';
			case 'pause-t1':
				return 'Continue to Aspiration';
			case 'pause-t2':
				return state.routing?.finalForm ? 'View your vector' : '';
			case 'pause-t3':
				return 'View your vector';
			default:
				return 'Continue';
		}
	});
</script>

<section class="billboard">
	{#each lines as line (line.phaseName + line.verb)}
		<article class="card">
			<p class="headline">
				In <strong>{line.phaseName}</strong> you {line.verb}:
			</p>
			<div class="labels">
				{#each line.passes as pass (pass.mode)}
					<div
						class="label-row"
						class:scouting={pass.mode === 'scouting'}
						class:bound={pass.mode === 'bound'}
					>
						<div class="label-head">
							{#if line.passes.length > 1}
								<span class="mode">{pass.mode === 'scouting' ? 'Scouting' : 'Bound'}</span>
							{/if}
							{#if pass.shadow}
								<span class="shadow">Shadow</span>
							{/if}
						</div>
						<p class="profile">{pass.archetype.name}</p>
						<p class="tagline">{pass.archetype.tagline}</p>
						<p class="description">{pass.archetype.description}</p>
					</div>
				{/each}
			</div>
		</article>
	{/each}

	{#if showHorizonChoice && partialSections.length}
		<div class="mapping-so-far">
			<h3>Your mapping so far</h3>
			<div class="sections">
				{#each partialSections as section (section.id)}
					<article class="mini-section">
						<h4>{section.context ?? section.phaseLabel}</h4>
						{#each section.passes as pass (pass.mode)}
							<p class="mini-pass">
								{#if section.passes.length > 1}
									<span class="mini-mode">{pass.mode === 'scouting' ? 'Scouting' : 'Bound'}:</span>
								{/if}
								{pass.archetype.name}
							</p>
						{/each}
					</article>
				{/each}
			</div>
		</div>
	{/if}

	<div class="actions">
		{#if showHorizonChoice}
			<button type="button" class="primary" onclick={() => includeHorizon()}>
				Add Horizon to mapping
			</button>
			<button type="button" class="secondary" onclick={() => skipHorizon()}>
				Finish without Horizon
			</button>
		{:else if continueLabel}
			<button type="button" class="primary" onclick={() => continueFromPause()}>
				{continueLabel}
			</button>
		{/if}
	</div>
</section>

<style>
	.billboard {
		width: 100%;
	}

	.card {
		padding: 1.5rem 1.25rem;
		border: 1px solid var(--border);
		border-radius: 14px;
		background: var(--surface);
		margin-bottom: 1.5rem;
	}

	.headline {
		margin: 0 0 1.25rem;
		font-size: clamp(1.15rem, 2.5vw, 1.35rem);
		line-height: 1.5;
	}

	.headline strong {
		font-family: 'Fraunces', Georgia, serif;
		font-weight: 600;
	}

	.labels {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.label-row {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.35rem;
		padding: 1rem 1.1rem;
		border-radius: 10px;
		border: 1px solid var(--border);
		background: var(--bg);
	}

	.label-row.scouting {
		border-left: 3px solid var(--scouting);
	}

	.label-row.bound {
		border-left: 3px solid var(--bound);
	}

	.label-head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.15rem;
	}

	.mode {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--muted);
	}

	.profile {
		margin: 0;
		font-family: 'Fraunces', Georgia, serif;
		font-size: clamp(1.25rem, 2.8vw, 1.55rem);
		font-weight: 600;
		line-height: 1.3;
	}

	.tagline {
		margin: 0;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--muted);
		font-style: italic;
	}

	.description {
		margin: 0.55rem 0 0;
		font-size: 0.95rem;
		line-height: 1.55;
		color: var(--text);
		max-width: 40rem;
	}

	.shadow {
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.12rem 0.45rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--danger) 12%, transparent);
		color: var(--danger);
	}

	.mapping-so-far {
		margin-bottom: 1.75rem;
	}

	.mapping-so-far h3 {
		margin: 0 0 1rem;
		font-family: 'Fraunces', Georgia, serif;
		font-size: 1.1rem;
	}

	.sections {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.mini-section {
		padding: 0.85rem 1rem;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
	}

	.mini-section h4 {
		margin: 0 0 0.45rem;
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--muted);
	}

	.mini-pass {
		margin: 0.2rem 0 0;
		font-size: 0.95rem;
		line-height: 1.4;
	}

	.mini-mode {
		font-weight: 600;
		color: var(--muted);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	button {
		padding: 0.75rem 1.35rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
	}

	.primary {
		border: none;
		background: var(--accent);
		color: #fff;
	}

	.secondary {
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
	}
</style>
