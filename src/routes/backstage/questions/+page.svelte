<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<header class="page-head">
	<h1>Questions</h1>
	<p class="lede">
		Live survey catalog ({data.counts.quickVibe} Quick Vibe · {data.counts.deepDive} Deep Dive),
		grouped by axis.
	</p>
</header>

<section class="bank">
	<h2>Quick Vibe</h2>
	<p class="hint">Used for Past eras (T0) — one item per axis.</p>
	{#each data.quickVibe as group (group.axis)}
		<div class="axis">
			<h3>{group.label}</h3>
			<ol>
				{#each group.questions as q (q.id)}
					<li>
						<code class="id">{q.id}</code>
						<span class="text">{q.text}</span>
					</li>
				{/each}
			</ol>
		</div>
	{/each}
</section>

<section class="bank">
	<h2>Deep Dive</h2>
	<p class="hint">Used for Present, Aspiration, and Horizon — five items per axis.</p>
	{#each data.deepDive as group (group.axis)}
		<div class="axis">
			<h3>{group.label}</h3>
			<ol>
				{#each group.questions as q (q.id)}
					<li>
						<code class="id">{q.id}</code>
						<span class="text">{q.text}</span>
					</li>
				{/each}
			</ol>
		</div>
	{/each}
</section>

<style>
	.page-head {
		margin-bottom: 1.5rem;
	}

	h1 {
		margin: 0;
		font-family: 'Fraunces', Georgia, serif;
		font-size: 1.75rem;
	}

	.lede {
		margin: 0.5rem 0 0;
		color: var(--muted);
		line-height: 1.5;
	}

	.bank {
		margin-bottom: 2rem;
		padding: 1.25rem;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface);
	}

	.bank h2 {
		margin: 0 0 0.35rem;
		font-size: 1.15rem;
	}

	.hint {
		margin: 0 0 1rem;
		font-size: 0.88rem;
		color: var(--muted);
	}

	.axis + .axis {
		margin-top: 1.25rem;
		padding-top: 1.1rem;
		border-top: 1px solid var(--border);
	}

	.axis h3 {
		margin: 0 0 0.65rem;
		font-size: 0.95rem;
		color: var(--accent);
	}

	ol {
		margin: 0;
		padding-left: 1.2rem;
	}

	li {
		margin-bottom: 0.75rem;
		line-height: 1.45;
	}

	.id {
		display: inline-block;
		margin-right: 0.45rem;
		font-size: 0.75rem;
		color: var(--muted);
	}

	.text {
		font-size: 0.92rem;
	}
</style>
