<script lang="ts">
	import { onMount } from 'svelte';
	import { betaMode } from '$lib/appMode';
	import { exportSurveyKey, hydrateSurvey, peekSurveyPhase, survey } from '$lib/store';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let ready = $state(false);
	let notice = $state<string | null>(null);

	onMount(() => {
		hydrateSurvey();
		ready = true;
	});

	const phase = $derived(ready ? $survey.phase : peekSurveyPhase());
	const saveKey = $derived(ready ? exportSurveyKey($survey) : '');

	async function copyKey() {
		notice = null;
		try {
			await navigator.clipboard.writeText(saveKey);
			notice = 'Save key copied.';
		} catch {
			notice = 'Could not copy — select the key manually.';
		}
	}
</script>

<main class="account">
	<header class="head">
		<div>
			<p class="eyebrow">Beta access</p>
			<h1>Your session</h1>
			<p class="meta">
				Signed in as <strong>beta user</strong>
				{#if data.role}
					· role <code>{data.role}</code>
				{/if}
			</p>
		</div>
		<nav class="nav">
			<a href="/">Home</a>
			<a href="/survey">Survey</a>
			<form method="POST" action="/access?/logout">
				<button type="submit" class="logout">Log out</button>
			</form>
		</nav>
	</header>

	<section class="panel">
		<h2>Survey progress</h2>
		{#if ready}
			<dl class="facts">
				<dt>Mode</dt>
				<dd><code>{betaMode ? 'beta invite' : 'release'}</code></dd>
				<dt>Phase</dt>
				<dd><code>{phase}</code></dd>
				<dt>Past eras</dt>
				<dd><code>{$survey.eras.length}</code></dd>
			</dl>

			<p class="blurb">
				Your answers stay in this browser. Copy your private save key if you want to continue on
				another device.
			</p>

			<div class="actions">
				<button type="button" onclick={copyKey}>Copy save key</button>
			</div>

			{#if notice}
				<p class="notice" role="status">{notice}</p>
			{/if}

			<label class="field">
				<span>Save key</span>
				<textarea readonly rows={4} value={saveKey}></textarea>
			</label>
		{:else}
			<p class="loading">Loading…</p>
		{/if}
	</section>
</main>

<style>
	.account {
		max-width: 40rem;
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

	h1 {
		margin: 0;
		font-family: 'Fraunces', Georgia, serif;
		font-size: 1.75rem;
	}

	.meta {
		margin: 0.4rem 0 0;
		font-size: 0.9rem;
		color: var(--muted);
	}

	.meta code {
		font-size: 0.85rem;
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

	.panel {
		padding: 1.25rem;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface);
	}

	.panel h2 {
		margin: 0 0 1rem;
		font-size: 1.05rem;
	}

	.facts {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.35rem 1rem;
		margin: 0 0 1rem;
		font-size: 0.9rem;
	}

	.facts dt {
		color: var(--muted);
	}

	.facts dd {
		margin: 0;
	}

	.blurb {
		margin: 0 0 1rem;
		font-size: 0.9rem;
		line-height: 1.45;
		color: var(--muted);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.actions button {
		padding: 0.45rem 0.75rem;
		min-height: 2.4rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg);
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
	}

	.actions button:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.notice {
		margin: 0 0 1rem;
		font-size: 0.85rem;
		color: var(--accent);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		margin-bottom: 0;
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--muted);
	}

	textarea {
		width: 100%;
		padding: 0.55rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg);
		color: var(--text);
		font-family: ui-monospace, 'Cascadia Code', Menlo, monospace;
		font-size: 0.72rem;
		font-weight: 400;
		line-height: 1.35;
		resize: vertical;
	}

	.loading {
		margin: 0;
		color: var(--muted);
	}
</style>
