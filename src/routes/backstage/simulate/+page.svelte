<script lang="ts">
	import { resolveArchetype } from '$lib/labels';

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

	/** Orthant sign character. */
	function sign(v: number) {
		return v >= 0 ? '+' : '−';
	}

	/** Pole name for a given score. */
	function pole(v: number, pos: string, neg: string) {
		return v >= 0 ? pos : neg;
	}

	const coords = $derived({ w, x, y, z });
	const archetype = $derived(resolveArchetype(coords));

	const descriptor = $derived(
		[
			pole(w, 'Interdependent', 'Autonomous'),
			pole(x, 'Recreational', 'Romantic'),
			pole(y, 'Contained', 'Permeable'),
			pole(z, 'Directed', 'Organic')
		].join(' · ')
	);

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
		<div class="signs-row">
			<span class="sign-chip" style="--c:#9b7fe8">W{sign(w)}</span>
			<span class="sign-chip" style="--c:#9e7982">X{sign(x)}</span>
			<span class="sign-chip" style="--c:#c4a574">Y{sign(y)}</span>
			<span class="sign-chip" style="--c:#7a9e9a">Z{sign(z)}</span>
		</div>

		<p class="descriptor">{descriptor}</p>

		<div class="result-divider"></div>

		<p class="archetype-name">{archetype.name}</p>
		<p class="archetype-desc">{archetype.description}</p>

		<p class="resolver-note">
			V1 resolver active — XYZ only. W (Architecture) is not yet included in archetype names.
		</p>
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
		margin: 0 0 0.4rem;
		font-family: 'Fraunces', Georgia, serif;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.archetype-desc {
		margin: 0 0 1.25rem;
		font-size: 0.88rem;
		color: var(--muted);
		line-height: 1.65;
		max-width: 56ch;
	}

	.resolver-note {
		margin: 0;
		font-size: 0.78rem;
		color: var(--muted);
		opacity: 0.7;
		font-style: italic;
	}
</style>
