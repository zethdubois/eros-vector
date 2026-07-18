<script lang="ts">
	import { buildResultSections, type QuestionBanks } from '$lib/results';
	import { navigateToSection, resetSurvey, type SurveyState } from '$lib/store';
	import { canAddHorizon, canAddPastEras } from '$lib/surveyNav';

	let {
		state: surveyState,
		banks
	}: {
		state: SurveyState;
		banks: QuestionBanks;
	} = $props();

	const sections = $derived(buildResultSections(surveyState, banks));
	const showAddPast = $derived(canAddPastEras(surveyState));
	const showAddHorizon = $derived(canAddHorizon(surveyState));

	let expanded = $state<Record<string, boolean>>({});

	function passKey(sectionId: string, mode: string) {
		return `${sectionId}:${mode}`;
	}

	function togglePass(sectionId: string, mode: string) {
		const key = passKey(sectionId, mode);
		expanded = { ...expanded, [key]: !expanded[key] };
	}
</script>

<section class="results">
	<header class="intro">
		<h2>Your vector</h2>
		<p class="lede">
			Your archetype for each time layer and operating mode. Tap a card to read the full
			description.
		</p>
	</header>

	<div class="sections">
		{#each sections as section (section.id)}
			<article class="section">
				<header class="section-head">
					<h3>{section.phaseLabel}</h3>
					{#if section.context}
						<p class="context">{section.context}</p>
					{/if}
				</header>

				<div class="passes">
					{#each section.passes as pass (pass.mode)}
						{@const key = passKey(section.id, pass.mode)}
						{@const open = !!expanded[key]}
						<button
							type="button"
							class="pass"
							class:scouting={pass.mode === 'scouting'}
							class:bound={pass.mode === 'bound'}
							class:open
							aria-expanded={open}
							onclick={() => togglePass(section.id, pass.mode)}
						>
							<div class="pass-meta">
								<span class="mode">{pass.mode === 'scouting' ? 'Scouting' : 'Bound'}</span>
								{#if pass.shadow}
									<span class="shadow">Shadow</span>
								{/if}
								<span class="hint">{open ? 'Hide' : 'Read more'}</span>
							</div>
							<p class="profile">{pass.archetype.name}</p>
							<p class="tagline">{pass.archetype.tagline}</p>
							{#if open}
								<p class="description">{pass.archetype.description}</p>
							{/if}
						</button>
					{/each}
				</div>
			</article>
		{/each}
	</div>

	{#if showAddPast || showAddHorizon}
		<div class="extras">
			{#if showAddPast}
				<button type="button" class="extra" onclick={() => navigateToSection('t0')}>
					Add past era
				</button>
			{/if}
			{#if showAddHorizon}
				<button type="button" class="extra" onclick={() => navigateToSection('t3')}>
					Add Horizon to mapping
				</button>
			{/if}
		</div>
	{/if}

	<button
		type="button"
		class="restart"
		onclick={() => {
			if (confirm('Clear all survey progress and start over?')) resetSurvey();
		}}
	>
		Restart
	</button>
</section>

<style>
	.results {
		width: 100%;
	}

	.intro h2 {
		margin: 0 0 0.5rem;
		font-family: 'Fraunces', Georgia, serif;
		font-size: clamp(1.5rem, 3vw, 1.85rem);
	}

	.lede {
		margin: 0 0 2rem;
		color: var(--muted);
		max-width: 36rem;
		line-height: 1.5;
	}

	.sections {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
		margin-bottom: 2rem;
	}

	.section {
		padding: 1.25rem 1.1rem;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface);
	}

	.section-head h3 {
		margin: 0 0 0.25rem;
		font-family: 'Fraunces', Georgia, serif;
		font-size: 1.15rem;
	}

	.context {
		margin: 0 0 1rem;
		font-size: 0.92rem;
		color: var(--muted);
		line-height: 1.45;
	}

	.passes {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.pass {
		display: block;
		width: 100%;
		text-align: left;
		padding: 0.9rem 1rem;
		border-radius: 10px;
		border: 1px solid var(--border);
		background: var(--bg);
		color: inherit;
		font: inherit;
		cursor: pointer;
		transition:
			border-color 0.15s ease,
			background 0.15s ease;
	}

	.pass:hover {
		border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
	}

	.pass.scouting {
		border-left: 3px solid var(--scouting);
	}

	.pass.bound {
		border-left: 3px solid var(--bound);
	}

	.pass.open {
		background: color-mix(in srgb, var(--accent) 4%, var(--bg));
	}

	.pass-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.45rem;
	}

	.mode {
		font-size: 0.78rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--muted);
	}

	.hint {
		margin-left: auto;
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--accent);
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

	.profile {
		margin: 0;
		font-family: 'Fraunces', Georgia, serif;
		font-size: clamp(1.2rem, 2.5vw, 1.45rem);
		font-weight: 600;
		line-height: 1.35;
	}

	.tagline {
		margin: 0.35rem 0 0;
		font-size: 0.85rem;
		font-weight: 500;
		font-style: italic;
		color: var(--muted);
	}

	.description {
		margin: 0.75rem 0 0;
		font-size: 0.95rem;
		line-height: 1.55;
		color: var(--text);
		max-width: 40rem;
	}

	.extras {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.extra {
		padding: 0.65rem 1.15rem;
		border: 1px solid var(--accent);
		border-radius: 8px;
		background: var(--accent-soft);
		color: var(--accent);
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
	}

	.extra:hover {
		background: color-mix(in srgb, var(--accent) 12%, var(--surface));
	}

	.restart {
		padding: 0.65rem 1.25rem;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
	}

	.restart:hover {
		border-color: var(--danger);
		color: var(--danger);
	}
</style>
