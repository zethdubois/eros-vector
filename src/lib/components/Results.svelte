<script lang="ts">
	import { buildResultSections } from '$lib/results';
	import { resetSurvey, type SurveyState } from '$lib/store';

	let { state }: { state: SurveyState } = $props();

	const sections = $derived(buildResultSections(state));
</script>

<section class="results">
	<header class="intro">
		<h2>Your vector</h2>
		<p class="lede">
			Plain-language labels for each time layer and operating mode. 3D visualization comes next.
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
						<div class="pass" class:scouting={pass.mode === 'scouting'} class:bound={pass.mode === 'bound'}>
							<div class="pass-meta">
								<span class="mode">{pass.mode === 'scouting' ? 'Scouting' : 'Bound'}</span>
								{#if pass.shadow}
									<span class="shadow">Shadow</span>
								{/if}
							</div>
							<p class="profile">{pass.profileLabel}</p>
						</div>
					{/each}
				</div>
			</article>
		{/each}
	</div>

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
		padding: 0.9rem 1rem;
		border-radius: 10px;
		border: 1px solid var(--border);
		background: var(--bg);
	}

	.pass.scouting {
		border-left: 3px solid var(--scouting);
	}

	.pass.bound {
		border-left: 3px solid var(--bound);
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
