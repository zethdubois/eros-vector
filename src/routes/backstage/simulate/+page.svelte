<script lang="ts">
	import { resolveArchetype, resolveNeighbors } from '$lib/labels';

	// Four axis scores, range −2 to +2, default 0 (balanced centre)
	let w = $state(0);
	let x = $state(0);
	let y = $state(0);
	let z = $state(0);

	/** CSS percentage for the slider thumb position (0 % = far left = −2). */
	function pct(v: number) {
		return ((v + 2) / 4) * 100;
	}

	/** Signed display string, e.g. "+1.2" or "−0.8". */
	function fmt(v: number) {
		return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1);
	}

	/** Orthant sign character — shows 0 at the exact centre. */
	function sign(v: number) {
		return v === 0 ? '0' : v > 0 ? '+' : '−';
	}

	const coords = $derived({ w, x, y, z });
	const archetype = $derived(resolveArchetype(coords));
	const neighbors = $derived(resolveNeighbors(coords));

	/** Per-axis descriptor parts. Zero-scored axes show "Balanced" in the axis color. */
	const descriptorParts = $derived([
		{ label: w === 0 ? 'Balanced' : w > 0 ? 'Interdependent' : 'Autonomous', color: w === 0 ? '#9b7fe8' : null },
		{ label: x === 0 ? 'Balanced' : x > 0 ? 'Recreational'   : 'Romantic',   color: x === 0 ? '#9e7982' : null },
		{ label: y === 0 ? 'Balanced' : y > 0 ? 'Contained'       : 'Permeable',  color: y === 0 ? '#c4a574' : null },
		{ label: z === 0 ? 'Balanced' : z > 0 ? 'Directed'        : 'Organic',    color: z === 0 ? '#7a9e9a' : null }
	]);

	function reset() {
		w = 0;
		x = 0;
		y = 0;
		z = 0;
	}
</script>

<section>
	<div class="page-head">
		<div>
			<h1>Simulate</h1>
			<p class="sub">Drag any slider to explore orientations — the orthant resolves instantly.</p>
		</div>
		<button onclick={reset} class="reset-btn">Reset to zero</button>
	</div>

	<!-- ── Sliders ── -->
	<div class="sliders">
		<!-- W — Architecture -->
		<div class="slider-row">
			<div class="row-meta">
				<span class="ax-letter" style="color:#9b7fe8">W</span>
				<span class="ax-domain">Architecture</span>
				<span class="ax-val">{fmt(w)}</span>
			</div>
			<div class="track-line">
				<span class="pole-label minus">Autonomous</span>
				<div class="track-wrap">
					<input
						type="range"
						min="-2"
						max="2"
						step="0.1"
						bind:value={w}
						style="--pct:{pct(w)}%;--col:#9b7fe8"
						aria-label="W Architecture"
					/>
				</div>
				<span class="pole-label plus">Interdependent</span>
			</div>
		</div>

		<!-- X — Drive -->
		<div class="slider-row">
			<div class="row-meta">
				<span class="ax-letter" style="color:#9e7982">X</span>
				<span class="ax-domain">Drive</span>
				<span class="ax-val">{fmt(x)}</span>
			</div>
			<div class="track-line">
				<span class="pole-label minus">Romantic</span>
				<div class="track-wrap">
					<input
						type="range"
						min="-2"
						max="2"
						step="0.1"
						bind:value={x}
						style="--pct:{pct(x)}%;--col:#9e7982"
						aria-label="X Drive"
					/>
				</div>
				<span class="pole-label plus">Recreational</span>
			</div>
		</div>

		<!-- Y — Permeability -->
		<div class="slider-row">
			<div class="row-meta">
				<span class="ax-letter" style="color:#c4a574">Y</span>
				<span class="ax-domain">Permeability</span>
				<span class="ax-val">{fmt(y)}</span>
			</div>
			<div class="track-line">
				<span class="pole-label minus">Permeable</span>
				<div class="track-wrap">
					<input
						type="range"
						min="-2"
						max="2"
						step="0.1"
						bind:value={y}
						style="--pct:{pct(y)}%;--col:#c4a574"
						aria-label="Y Permeability"
					/>
				</div>
				<span class="pole-label plus">Contained</span>
			</div>
		</div>

		<!-- Z — Method -->
		<div class="slider-row">
			<div class="row-meta">
				<span class="ax-letter" style="color:#7a9e9a">Z</span>
				<span class="ax-domain">Method</span>
				<span class="ax-val">{fmt(z)}</span>
			</div>
			<div class="track-line">
				<span class="pole-label minus">Organic</span>
				<div class="track-wrap">
					<input
						type="range"
						min="-2"
						max="2"
						step="0.1"
						bind:value={z}
						style="--pct:{pct(z)}%;--col:#7a9e9a"
						aria-label="Z Method"
					/>
				</div>
				<span class="pole-label plus">Directed</span>
			</div>
		</div>
	</div>

	<!-- ── Orthant result ── -->
	<div class="result">
		<!-- Signs -->
		<div class="signs-row">
			<span class="sign-chip" style="--c:#9b7fe8">W{sign(w)}</span>
			<span class="sign-chip" style="--c:#9e7982">X{sign(x)}</span>
			<span class="sign-chip" style="--c:#c4a574">Y{sign(y)}</span>
			<span class="sign-chip" style="--c:#7a9e9a">Z{sign(z)}</span>
		</div>

		<p class="descriptor">
			{#each descriptorParts as part, i}
				{#if i > 0}<span class="descriptor-sep"> · </span>{/if}
				{#if part.color !== null}
					<span style="color:{part.color}">{part.label}</span>
				{:else}
					{part.label}
				{/if}
			{/each}
		</p>

		<div class="result-divider"></div>

		<!-- Primary archetype -->
		<p class="archetype-name">{archetype.name}</p>
		<p class="archetype-sig">{archetype.signature}</p>
		<p class="archetype-desc">{archetype.description}</p>

		<!-- ── Neighbouring influences ── -->
		{#if archetype.id === 'schrodingers-partner'}
			<div class="result-divider"></div>
			<p class="nb-schrodinger">
				You are at the exact origin — equidistant from all 16 archetypes. Every neighbouring
				influence fires at maximum pull in all directions simultaneously. Move any slider to
				see which boundaries you approach.
			</p>
		{:else if neighbors.length > 0}
			<div class="result-divider"></div>
			<p class="nb-heading">Neighbouring influences</p>
			<div class="nb-list">
				{#each neighbors as nb}
					<div class="nb-card">
						<div class="nb-left">
							<span class="nb-chip" style="--c:{nb.axisColor}">{nb.axisLabel}</span>
						</div>
						<div class="nb-body">
							<div class="nb-approach">
								Approaching <strong>{nb.approachingPole}</strong>
								<span class="nb-domain-label">· {nb.domain}</span>
							</div>
							<div class="nb-archetype-name">{nb.archetype.name}</div>
							<div class="nb-archetype-sig">{nb.archetype.signature}</div>
							<div class="nb-bar-wrap" title="Pull strength {(nb.pullStrength * 100).toFixed(0)}%">
								<div
									class="nb-bar"
									style="--w:{(nb.pullStrength * 100).toFixed(1)}%;--c:{nb.axisColor}"
								></div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

<style>
	section {
		padding-bottom: 4rem;
	}

	.page-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 2rem;
	}

	h1 {
		margin: 0 0 0.2rem;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.sub {
		margin: 0;
		font-size: 0.9rem;
		color: var(--muted);
	}

	.reset-btn {
		margin-top: 0.15rem;
		padding: 0.4rem 0.85rem;
		min-height: 2.25rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
	}

	.reset-btn:hover {
		border-color: var(--muted);
	}

	/* ── Sliders ── */

	.sliders {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
		margin-bottom: 2.25rem;
	}

	.slider-row {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.row-meta {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}

	.ax-letter {
		font-size: 1rem;
		font-weight: 700;
		font-family: 'Fraunces', Georgia, serif;
		line-height: 1;
		width: 1.1rem;
	}

	.ax-domain {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--muted);
		flex: 1;
	}

	.ax-val {
		font-size: 0.82rem;
		font-variant-numeric: tabular-nums;
		color: var(--muted);
		min-width: 3rem;
		text-align: right;
	}

	.track-line {
		display: grid;
		grid-template-columns: 7rem 1fr 7rem;
		align-items: center;
		gap: 0.75rem;
	}

	@media (max-width: 600px) {
		.track-line {
			grid-template-columns: 5.5rem 1fr 5.5rem;
			gap: 0.5rem;
		}
	}

	.pole-label {
		font-size: 0.78rem;
		color: var(--muted);
		line-height: 1.2;
	}

	.pole-label.minus {
		text-align: right;
	}

	.pole-label.plus {
		text-align: left;
	}

	.track-wrap {
		position: relative;
	}

	/* centre-zero tick mark */
	.track-wrap::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 2px;
		height: 10px;
		background: currentColor;
		opacity: 0.18;
		pointer-events: none;
		border-radius: 1px;
	}

	input[type='range'] {
		display: block;
		width: 100%;
		height: 4px;
		appearance: none;
		-webkit-appearance: none;
		border-radius: 2px;
		outline: none;
		cursor: pointer;
		background: linear-gradient(
			to right,
			color-mix(in srgb, currentColor 14%, transparent) min(50%, var(--pct)),
			var(--col) min(50%, var(--pct)),
			var(--col) max(50%, var(--pct)),
			color-mix(in srgb, currentColor 14%, transparent) max(50%, var(--pct))
		);
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--col);
		cursor: pointer;
		border: 2px solid color-mix(in srgb, var(--col) 40%, white);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
		transition: box-shadow 0.15s;
	}

	input[type='range']::-webkit-slider-thumb:hover {
		box-shadow:
			0 1px 4px rgba(0, 0, 0, 0.25),
			0 0 0 4px color-mix(in srgb, var(--col) 22%, transparent);
	}

	input[type='range']::-moz-range-thumb {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--col);
		cursor: pointer;
		border: 2px solid color-mix(in srgb, var(--col) 40%, white);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
	}

	input[type='range']::-moz-range-track {
		height: 4px;
		border-radius: 2px;
		background: transparent;
	}

	/* ── Result card ── */

	.result {
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 1.5rem 1.75rem;
		background: var(--surface);
	}

	.signs-row {
		display: flex;
		gap: 0.6rem;
		margin-bottom: 0.75rem;
	}

	.sign-chip {
		display: inline-flex;
		align-items: center;
		padding: 0.2rem 0.6rem;
		border-radius: 5px;
		background: color-mix(in srgb, var(--c) 16%, transparent);
		border: 1px solid color-mix(in srgb, var(--c) 35%, transparent);
		color: var(--c);
		font-size: 0.82rem;
		font-weight: 700;
		font-family: 'Courier New', monospace;
		letter-spacing: 0.04em;
	}

	.descriptor {
		margin: 0 0 1.25rem;
		font-size: 1.1rem;
		font-weight: 600;
	}

	.result-divider {
		border-top: 1px solid var(--border);
		margin-bottom: 1.25rem;
	}

	.archetype-name {
		margin: 0 0 0.2rem;
		font-family: 'Fraunces', Georgia, serif;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.archetype-sig {
		margin: 0 0 0.65rem;
		font-size: 0.82rem;
		font-style: italic;
		color: var(--muted);
	}

	.archetype-desc {
		margin: 0;
		font-size: 0.88rem;
		color: var(--muted);
		line-height: 1.65;
		max-width: 56ch;
	}

	/* ── Neighbours ── */

	.nb-schrodinger {
		margin: 0;
		font-size: 0.85rem;
		color: var(--muted);
		font-style: italic;
		line-height: 1.6;
	}

	.nb-heading {
		margin: 0 0 0.85rem;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.nb-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.nb-card {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
	}

	.nb-left {
		padding-top: 0.1rem;
		flex-shrink: 0;
	}

	.nb-chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 5px;
		background: color-mix(in srgb, var(--c) 16%, transparent);
		border: 1px solid color-mix(in srgb, var(--c) 35%, transparent);
		color: var(--c);
		font-size: 0.78rem;
		font-weight: 700;
		font-family: 'Fraunces', Georgia, serif;
	}

	.nb-body {
		flex: 1;
		min-width: 0;
	}

	.nb-approach {
		font-size: 0.82rem;
		margin-bottom: 0.15rem;
	}

	.nb-approach strong {
		font-weight: 600;
	}

	.nb-domain-label {
		color: var(--muted);
		font-size: 0.78rem;
	}

	.nb-archetype-name {
		font-family: 'Fraunces', Georgia, serif;
		font-size: 0.95rem;
		font-weight: 600;
		margin-bottom: 0.1rem;
	}

	.nb-archetype-sig {
		font-size: 0.78rem;
		color: var(--muted);
		font-style: italic;
		margin-bottom: 0.5rem;
	}

	.nb-bar-wrap {
		height: 4px;
		border-radius: 2px;
		background: color-mix(in srgb, currentColor 10%, transparent);
		overflow: hidden;
		max-width: 16rem;
	}

	.nb-bar {
		height: 100%;
		width: var(--w);
		border-radius: 2px;
		background: var(--c);
		transition: width 0.2s ease;
	}
</style>
