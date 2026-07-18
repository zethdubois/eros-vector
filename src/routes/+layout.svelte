<script lang="ts">
	import { page } from '$app/state';
	import './layout.css';
	import SaveKeyPanel from '$lib/components/SaveKeyPanel.svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();

	const showSaveKey = $derived(!page.url.pathname.startsWith('/access'));
	const showBackstageLink = $derived(
		data.canAccessBackstage &&
			!page.url.pathname.startsWith('/backstage') &&
			!page.url.pathname.startsWith('/access')
	);
	const onDarkSplash = $derived(page.url.pathname === '/');
</script>

<svelte:head>
	<title>Eros Vector</title>
	<meta
		name="description"
		content="A 4D relationship mapping tool. Plot your trajectory across Structure, Eroticism, and Intent — plus Time."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Outfit:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{#if showBackstageLink}
	<a class="backstage-link" class:on-dark={onDarkSplash} href="/backstage">backstage</a>
{/if}

{@render children()}

{#if showSaveKey}
	<SaveKeyPanel />
{/if}

<style>
	.backstage-link {
		position: fixed;
		top: 1rem;
		left: 1rem;
		z-index: 40;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--muted);
		text-decoration: underline;
		text-underline-offset: 0.15em;
	}

	.backstage-link:hover {
		color: var(--accent);
	}

	.backstage-link.on-dark {
		color: color-mix(in srgb, var(--cream) 72%, transparent);
	}

	.backstage-link.on-dark:hover {
		color: var(--cream);
	}
</style>
