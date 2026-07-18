<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<header class="page-head">
	<h1>Wiki</h1>
	<p class="lede">
		Domain authorship — the framework language, archetypes, and pitch. Engineering notes stay
		in the repo under <code>docs/dev/</code>.
	</p>
</header>

{#if data.articles.length === 0}
	<p class="empty">No wiki articles found in <code>docs/wiki/</code>.</p>
{:else}
	<ul class="list">
		{#each data.articles as article (article.slug)}
			<li>
				<a href={`/backstage/wiki/${article.slug}`}>
					<span class="title">{article.title}</span>
					{#if article.summary}
						<span class="summary">{article.summary}</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
{/if}

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

	code {
		font-size: 0.85em;
	}

	.empty {
		color: var(--muted);
	}

	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.list a {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 1rem 1.1rem;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
		text-decoration: none;
		color: inherit;
	}

	.list a:hover {
		border-color: var(--accent);
	}

	.title {
		font-weight: 600;
		font-size: 1.05rem;
	}

	.summary {
		font-size: 0.88rem;
		color: var(--muted);
		line-height: 1.4;
	}
</style>
