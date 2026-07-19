<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<article class="prose">
	{@html data.article.html}
</article>

<style>
	.prose {
		max-width: 85ch;
		line-height: 1.65;
	}

	.prose :global(h1),
	.prose :global(h2),
	.prose :global(h3),
	.prose :global(h4) {
		font-family: 'Fraunces', Georgia, serif;
		letter-spacing: -0.01em;
		line-height: 1.25;
	}

	.prose :global(h1) {
		margin: 0 0 1rem;
		font-size: 1.85rem;
	}

	.prose :global(h2) {
		margin: 1.75rem 0 0.65rem;
		font-size: 1.35rem;
	}

	.prose :global(h3) {
		margin: 1.35rem 0 0.45rem;
		font-size: 1.15rem;
	}

	.prose :global(h4) {
		margin: 1.5rem 0 0.35rem;
		font-size: 1.05rem;
		font-family: inherit;
		font-weight: 700;
		letter-spacing: 0;
	}

	.prose :global(p),
	.prose :global(ul),
	.prose :global(ol) {
		margin: 0 0 0.9rem;
		text-wrap: pretty;
	}

	.prose :global(p:has(> em:only-child)) {
		margin-bottom: 0.45rem;
		color: color-mix(in srgb, var(--text) 88%, var(--muted));
	}

	.prose :global(li + li) {
		margin-top: 0.35rem;
	}

	.prose :global(hr) {
		border: 0;
		border-top: 1px solid var(--border);
		margin: 1.5rem 0;
	}

	.prose :global(em) {
		color: color-mix(in srgb, var(--text) 88%, var(--muted));
	}

	.prose :global(strong) {
		font-weight: 600;
	}

	.prose :global(code) {
		font-size: 0.88em;
		padding: 0.1em 0.35em;
		border-radius: 4px;
		background: var(--surface);
		border: 1px solid var(--border);
	}

	.prose :global(table) {
		width: 100%;
		max-width: 100%;
		margin: 0 0 1.25rem;
		border-collapse: collapse;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		font-size: 0.9rem;
		line-height: 1.4;
	}

	.prose :global(th),
	.prose :global(td) {
		padding: 0.6rem 0.75rem;
		border-right: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
		text-align: left;
		vertical-align: top;
		overflow-wrap: anywhere;
		white-space: normal;
	}

	.prose :global(th:last-child),
	.prose :global(td:last-child) {
		border-right: 0;
	}

	.prose :global(tr:last-child td) {
		border-bottom: 0;
	}

	.prose :global(th) {
		background: var(--bg);
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--muted);
	}

	.prose :global(tbody tr:nth-child(even)) {
		background: color-mix(in srgb, var(--bg) 45%, transparent);
	}

	@media (max-width: 640px) {
		.prose :global(table) {
			display: block;
			overflow-x: auto;
		}
	}
</style>
