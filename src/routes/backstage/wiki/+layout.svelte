<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();

	const activeSlug = $derived(page.params.slug ?? null);
</script>

<div class="wiki">
	<aside class="toc" aria-label="Wiki contents">
		<p class="toc-label">Contents</p>
		<nav>
			{#each data.articles as article (article.slug)}
				<a
					href={`/backstage/wiki/${article.slug}`}
					class:active={activeSlug === article.slug}
				>
					{article.filename}
				</a>
			{/each}
		</nav>
	</aside>

	<div class="main">
		{@render children()}
	</div>
</div>

<style>
	.wiki {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.toc {
		min-width: 0;
	}

	.toc-label {
		margin: 0 0 0.45rem;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.toc nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.toc a {
		display: inline-block;
		padding: 0.35rem 0.65rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		color: var(--text);
		font-family: ui-monospace, 'Cascadia Code', Menlo, monospace;
		font-size: 0.78rem;
		font-weight: 500;
		text-decoration: none;
	}

	.toc a:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.toc a.active {
		border-color: var(--accent);
		background: var(--accent-soft);
		color: var(--accent);
	}

	.main {
		min-width: 0;
		flex: 1;
	}

	/* Desktop: true sidebar — contents stay put while reading. */
	@media (min-width: 900px) {
		.wiki {
			flex-direction: row;
			align-items: flex-start;
			gap: 1.75rem;
		}

		.toc {
			position: sticky;
			top: 1rem;
			width: 11.5rem;
			flex-shrink: 0;
		}

		.toc nav {
			flex-direction: column;
			flex-wrap: nowrap;
			gap: 0.3rem;
		}

		.toc a {
			width: 100%;
			box-sizing: border-box;
		}
	}
</style>
