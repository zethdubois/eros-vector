<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<p class="crumb"><a href="/backstage/wiki">← Wiki</a></p>

<article class="prose">
	{@html data.article.html}
</article>

<style>
	.crumb {
		margin: 0 0 1.25rem;
		font-size: 0.9rem;
	}

	.crumb a {
		color: var(--muted);
		text-decoration: none;
		font-weight: 500;
	}

	.crumb a:hover {
		color: var(--accent);
	}

	.prose {
		line-height: 1.55;
	}

	.prose :global(h1),
	.prose :global(h2),
	.prose :global(h3) {
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

	.prose :global(p),
	.prose :global(ul),
	.prose :global(ol) {
		margin: 0 0 0.9rem;
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
</style>
