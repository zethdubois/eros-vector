<script lang="ts">
	import { page } from '$app/state';
	import './layout.css';
	import SaveKeyPanel from '$lib/components/SaveKeyPanel.svelte';
	import { survey } from '$lib/store';
	import type { LayoutData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();

	const path = $derived(page.url.pathname);
	const hiddenRoute = $derived(path.startsWith('/access') || path.startsWith('/legal'));

	/** Staff get backstage; viewers get the beta account link in the same corner.
	 *  On backstage pages, mirror that with a home escape hatch. */
	const cornerLink = $derived.by(() => {
		if (hiddenRoute || path.startsWith('/account')) return null;
		if (path.startsWith('/backstage')) return { href: '/', label: 'home' } as const;
		if (data.canAccessBackstage) return { href: '/backstage', label: 'backstage' } as const;
		if (data.accessRole === 'beta') return { href: '/account', label: 'beta user' } as const;
		return null;
	});

	/** Show the coloured role banner whenever the user is authenticated. */
	const showBanner = $derived(!!data.accessRole && !hiddenRoute);

	const sexAge = $derived($survey.intake?.sexAge ?? null);

	const bannerBg = $derived.by(() => {
		if (data.accessRole === 'developer') return '#c4b5fd'; // violet
		if (data.accessRole === 'reviewer') return '#fdba74'; // orange
		if (data.accessRole === 'beta') return '#fef08a'; // yellow
		return 'transparent';
	});
</script>

<svelte:head>
	<title>Eros Vector</title>
	<meta
		name="description"
		content="A 4D relationship mapping tool. Plot your trajectory across Architecture, Drive, and Method — plus Time."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Outfit:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{#if showBanner}
	<div class="role-banner" style="background: {bannerBg}">
		{#if cornerLink}
			<a class="corner-link" href={cornerLink.href}>{cornerLink.label}</a>
		{:else}
			<span></span>
		{/if}
		<div class="banner-right">
			{#if sexAge !== null}
				<span class="sex-age-pill"><span class="sex-age-label">sex-age</span>{sexAge}<span class="sex-age-unit">yr</span></span>
			{/if}
			<SaveKeyPanel floating={false} />
		</div>
	</div>
{/if}

{@render children()}

<style>
	.role-banner {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 40;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 0.875rem;
		min-height: 2.75rem;
	}

	.corner-link {
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--text);
		text-decoration: underline;
		text-underline-offset: 0.15em;
		opacity: 0.75;
	}

	.corner-link:hover {
		opacity: 1;
		color: var(--accent);
	}

	.banner-right {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.sex-age-pill {
		display: inline-flex;
		align-items: baseline;
		gap: 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		opacity: 0.7;
		color: var(--text);
	}

	.sex-age-label {
		font-weight: 500;
		opacity: 0.65;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-right: 0.15rem;
	}

	.sex-age-unit {
		font-size: 0.68rem;
		font-weight: 500;
		opacity: 0.7;
	}
</style>
