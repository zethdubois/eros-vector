<script lang="ts">
	import { page } from '$app/state';
	import './layout.css';
	import SaveKeyPanel from '$lib/components/SaveKeyPanel.svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();

	const path = $derived(page.url.pathname);
	const showSaveKey = $derived(!path.startsWith('/access') && !path.startsWith('/legal'));
	const onDarkSplash = $derived(path === '/');

	/** Staff get backstage; viewers get the beta account link in the same corner. */
	const cornerLink = $derived.by(() => {
		if (
			path.startsWith('/access') ||
			path.startsWith('/backstage') ||
			path.startsWith('/account') ||
			path.startsWith('/legal')
		) {
			return null;
		}
		if (data.canAccessBackstage) return { href: '/backstage', label: 'backstage' } as const;
		if (data.accessRole === 'viewer') return { href: '/account', label: 'beta user' } as const;
		return null;
	});
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

{#if cornerLink}
	<a class="corner-link" class:on-dark={onDarkSplash} href={cornerLink.href}>{cornerLink.label}</a>
{/if}

{@render children()}

{#if showSaveKey}
	<SaveKeyPanel />
{/if}

<style>
	.corner-link {
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

	.corner-link:hover {
		color: var(--accent);
	}

	.corner-link.on-dark {
		color: color-mix(in srgb, var(--cream) 72%, transparent);
	}

	.corner-link.on-dark:hover {
		color: var(--cream);
	}
</style>
