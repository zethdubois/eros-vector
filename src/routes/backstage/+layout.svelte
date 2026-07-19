<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();

	const wide = $derived(
		page.url.pathname.startsWith('/backstage/wiki') ||
			page.url.pathname.startsWith('/backstage/content')
	);
</script>

<div class="shell" class:wide>
	<header class="head">
		<div class="brand">
			<p class="eyebrow">Backstage</p>
			<p class="meta">
				Session role: <strong>{data.role ?? 'none'}</strong>
			</p>
		</div>
		<nav class="nav">
			<a href="/backstage">Debug</a>
			<a href="/backstage/simulate">Simulate</a>
			<a href="/backstage/wiki">Wiki</a>
			<a href="/backstage/content">Content</a>
			<form method="POST" action="/access?/logout">
				<button type="submit" class="logout">Log out</button>
			</form>
		</nav>
	</header>

	{@render children()}
</div>

<style>
	.shell {
		max-width: 44rem;
		margin: 0 auto;
		padding: 3.5rem 1.25rem 3rem;
		min-height: 100vh;
		min-height: 100dvh;
	}

	.shell.wide {
		max-width: 90rem;
		padding-left: 1.5rem;
		padding-right: 1.5rem;
	}

	@media (min-width: 1100px) {
		.shell.wide {
			padding-left: 2rem;
			padding-right: 2rem;
		}
	}

	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.75rem;
	}

	.brand {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.eyebrow {
		margin: 0 0 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.meta {
		margin: 0;
		font-size: 0.9rem;
		color: var(--muted);
	}

	.nav {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.65rem;
	}

	.nav a {
		font-size: 0.85rem;
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 0.15em;
	}

	.logout {
		padding: 0.4rem 0.75rem;
		min-height: 2.25rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
	}

	.logout:hover {
		border-color: var(--danger);
		color: var(--danger);
	}
</style>
