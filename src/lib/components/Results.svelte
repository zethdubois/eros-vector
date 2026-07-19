<script lang="ts">
	import { buildResultSections, type QuestionBanks, type ResultPass } from '$lib/results';
	import { navigateToSection, resetSurvey, type SurveyState } from '$lib/store';
	import { canAddHorizon, canAddPastEras } from '$lib/surveyNav';
	import { AXIS_META, type Neighbor } from '$lib/labels';
	import type { Axis } from '$lib/types';

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
	let selectedTab = $state<Record<string, number>>({});

	function passKey(sectionId: string, mode: string) {
		return `${sectionId}:${mode}`;
	}

	function togglePass(sectionId: string, mode: string) {
		const key = passKey(sectionId, mode);
		expanded = { ...expanded, [key]: !expanded[key] };
	}

	function tabIndex(key: string): number {
		return selectedTab[key] ?? 0;
	}

	/** Unique balanced axes across all passes in a section that have multiple co-equal archetypes. */
	function sectionBalancedAxes(passes: ResultPass[]): Axis[] {
		const seen = new Set<Axis>();
		const result: Axis[] = [];
		for (const p of passes) {
			if (p.archetypes.length > 1) {
				for (const a of ['w', 'x', 'y', 'z'] as Axis[]) {
					if (p.coordinates[a] === 0 && !seen.has(a)) {
						seen.add(a);
						result.push(a);
					}
				}
			}
		}
		return result;
	}

	/** Orthant sign character — shows 0 at the exact centre. */
	function sign(v: number): string {
		return v === 0 ? '0' : v > 0 ? '+' : '−';
	}

	/** Template sentence describing a neighbour's pull, scaled by proximity. */
	function neighborSentence(nb: Neighbor): string {
		const { domain, approachingPole, distanceToBoundary, archetype } = nb;
		if (distanceToBoundary < 0.3) {
			return `Your ${domain} score sits right on the ${approachingPole} boundary — you may strongly recognise yourself in ${archetype.name}.`;
		} else if (distanceToBoundary < 1.0) {
			return `You have a pull toward ${approachingPole} on ${domain} — ${archetype.name} may also resonate.`;
		} else {
			return `There is a mild pull toward ${approachingPole} on ${domain} — you may occasionally recognise ${archetype.name} in yourself.`;
		}
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
			{@const balAxes = sectionBalancedAxes(section.passes)}
			<article class="section">
				<header class="section-head">
					<h3>{section.phaseLabel}</h3>
					{#if section.context}
						<p class="context">{section.context}</p>
					{/if}
				</header>

				{#if balAxes.length > 0}
					<div class="balance-notice">
						{#each balAxes as axis, i}{#if i > 0}, {/if}<strong style="color:{AXIS_META[axis].color}">{AXIS_META[axis].label}</strong>{/each}{balAxes.length === 1 ? ' axis' : ' axes'} balanced — open the card to see all co-equal archetypes.
					</div>
				{/if}

				<div class="passes">
					{#each section.passes as pass (pass.mode)}
						{@const key = passKey(section.id, pass.mode)}
						{@const open = !!expanded[key]}
						<div
							class="pass"
							class:scouting={pass.mode === 'scouting'}
							class:bound={pass.mode === 'bound'}
							class:open
						>
							<button
								type="button"
								class="pass-header"
								aria-expanded={open}
								onclick={() => togglePass(section.id, pass.mode)}
							>
								<div class="signs-row">
									{#each (['w','x','y','z'] as const) as axis}
										<span class="sign-chip" style="--c:{AXIS_META[axis].color}">{AXIS_META[axis].label}{sign(pass.coordinates[axis])}</span>
									{/each}
								</div>
								<div class="pass-meta">
									<span class="mode">{pass.mode === 'scouting' ? 'Scouting' : 'Bound'}</span>
									{#if pass.shadow}
										<span class="shadow">Shadow</span>
									{/if}
									{#if pass.archetypes.length > 1}
										<span class="multi-badge">{pass.archetypes.length} archetypes</span>
									{/if}
									<span class="hint">{open ? 'Hide' : 'Read more'}</span>
								</div>
								<p class="profile">{pass.archetype.name}</p>
								<p class="tagline">{pass.archetype.tagline}</p>
							</button>
							{#if open}
								{@const activeIdx = tabIndex(key)}
								{@const activeAt = pass.archetypes[activeIdx]}
								<div class="pass-body">
									{#if pass.archetypes.length > 1}
										<div class="tab-strip" role="tablist">
											{#each pass.archetypes as at, i}
												<button
													type="button"
													role="tab"
													class="tab-btn"
													class:active={activeIdx === i}
													aria-selected={activeIdx === i}
													onclick={() => { selectedTab = { ...selectedTab, [key]: i }; }}
												>{at.name}</button>
											{/each}
										</div>
										<p class="tab-note">These archetypes are co-equal — your score sits exactly on the boundary between them.</p>
									{/if}
									<p class="description">{activeAt.description}</p>
									{#if pass.neighbors.length > 0}
										<div class="nb-section">
											<p class="nb-label">Neighbouring influences</p>
											<div class="nb-list">
												{#each pass.neighbors as nb}
													<div class="nb-item">
														<span class="nb-chip" style="--c:{nb.axisColor}">{nb.axisLabel}</span>
														<div class="nb-text">
															<p class="nb-sentence">{neighborSentence(nb)}</p>
															<p class="nb-sig">{nb.archetype.name} — {nb.archetype.signature}</p>
															<div class="nb-bar-wrap" title="Pull strength {(nb.pullStrength * 100).toFixed(0)}%">
																<div class="nb-bar" style="--w:{(nb.pullStrength * 100).toFixed(1)}%;--c:{nb.axisColor}"></div>
															</div>
														</div>
													</div>
												{/each}
											</div>
										</div>
									{/if}
								</div>
							{/if}
						</div>
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

	/* ── Balance notice ── */

	.balance-notice {
		margin: 0 0 1rem;
		padding: 0.55rem 0.85rem;
		border-radius: 7px;
		border: 1px solid color-mix(in srgb, var(--accent) 25%, var(--border));
		background: color-mix(in srgb, var(--accent) 5%, var(--bg));
		font-size: 0.82rem;
		line-height: 1.45;
		color: var(--muted);
	}

	.balance-notice strong {
		font-weight: 700;
	}

	/* ── Pass card ── */

	.passes {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.pass {
		border-radius: 10px;
		border: 1px solid var(--border);
		background: var(--bg);
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

	.pass-header {
		display: block;
		width: 100%;
		text-align: left;
		padding: 0.9rem 1rem;
		background: transparent;
		border: none;
		border-radius: 10px;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}

	.pass-body {
		padding: 0 1rem 1rem;
	}

	.pass-body > .description:first-child {
		margin-top: 0;
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

	.multi-badge {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.12rem 0.45rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--accent) 12%, transparent);
		color: var(--accent);
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

	/* ── Axis sign chips ── */

	.signs-row {
		display: flex;
		gap: 0.45rem;
		margin-bottom: 0.55rem;
	}

	.sign-chip {
		display: inline-flex;
		align-items: center;
		padding: 0.15rem 0.5rem;
		border-radius: 5px;
		background: color-mix(in srgb, var(--c) 16%, transparent);
		border: 1px solid color-mix(in srgb, var(--c) 35%, transparent);
		color: var(--c);
		font-size: 0.75rem;
		font-weight: 700;
		font-family: 'Courier New', monospace;
		letter-spacing: 0.04em;
	}

	/* ── Tab strip ── */

	.tab-strip {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-bottom: 0.65rem;
		padding-bottom: 0.65rem;
		border-bottom: 1px solid var(--border);
	}

	.tab-btn {
		padding: 0.3rem 0.8rem;
		border-radius: 6px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--muted);
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			background 0.12s,
			color 0.12s,
			border-color 0.12s;
		font-family: 'Fraunces', Georgia, serif;
	}

	.tab-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.tab-btn.active {
		background: color-mix(in srgb, var(--accent) 10%, var(--bg));
		border-color: var(--accent);
		color: var(--text);
	}

	.tab-note {
		margin: 0 0 0.65rem;
		font-size: 0.8rem;
		font-style: italic;
		color: var(--muted);
		opacity: 0.75;
	}

	.description {
		margin: 0.75rem 0 0;
		font-size: 0.95rem;
		line-height: 1.55;
		color: var(--text);
		max-width: 40rem;
	}

	/* ── Neighbouring influences ── */

	.nb-section {
		margin-top: 1.25rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}

	.nb-label {
		margin: 0 0 0.65rem;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
		opacity: 0.75;
	}

	.nb-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.nb-item {
		display: flex;
		gap: 0.65rem;
		align-items: flex-start;
	}

	.nb-chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 1.45rem;
		height: 1.45rem;
		margin-top: 0.05rem;
		border-radius: 4px;
		background: color-mix(in srgb, var(--c) 15%, transparent);
		border: 1px solid color-mix(in srgb, var(--c) 30%, transparent);
		color: var(--c);
		font-size: 0.72rem;
		font-weight: 700;
		font-family: 'Fraunces', Georgia, serif;
	}

	.nb-text {
		flex: 1;
		min-width: 0;
	}

	.nb-sentence {
		margin: 0 0 0.15rem;
		font-size: 0.83rem;
		line-height: 1.5;
		color: var(--muted);
	}

	.nb-sig {
		margin: 0;
		font-size: 0.76rem;
		font-style: italic;
		color: var(--muted);
		opacity: 0.65;
	}

	.nb-bar-wrap {
		margin-top: 0.4rem;
		height: 4px;
		border-radius: 2px;
		background: color-mix(in srgb, currentColor 10%, transparent);
		overflow: hidden;
		max-width: 14rem;
	}

	.nb-bar {
		height: 100%;
		width: var(--w);
		border-radius: 2px;
		background: var(--c);
		transition: width 0.2s ease;
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
