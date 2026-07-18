<script lang="ts">
	import type { LayoutData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();
</script>

<div class="shell">
	<header class="head">
		<div>
			<p class="eyebrow">Backstage</p>
			<p class="meta">
				Session role: <strong>{data.role ?? 'none'}</strong>
			</p>
		</div>
		<nav class="nav">
			<a href="/backstage">Debug</a>
			<a href="/backstage/wiki">Wiki</a>
			<a href="/backstage/questions">Questions</a>
			<a href="/">Home</a>
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

	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.75rem;
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
