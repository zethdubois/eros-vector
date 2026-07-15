<script lang="ts">
	import { survey } from '$lib/store';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import IntakeForm from '$lib/components/IntakeForm.svelte';
	import T0Eras from '$lib/components/T0Eras.svelte';
	import T1Present from '$lib/components/T1Present.svelte';
	import T2Aspiration from '$lib/components/T2Aspiration.svelte';
	import T3Horizon from '$lib/components/T3Horizon.svelte';
	import ResultsStub from '$lib/components/ResultsStub.svelte';
</script>

<main>
	<header class="brand">
		<h1>Eros Vector</h1>
		<p class="tagline">4D relationship mapping — survey engine</p>
	</header>

	<ProgressBar phase={$survey.phase} routing={$survey.routing} />

	{#if $survey.phase === 'intake'}
		<IntakeForm />
	{:else if $survey.phase === 't0'}
		<T0Eras eras={$survey.eras} />
	{:else if $survey.phase === 't1'}
		<T1Present present={$survey.present} />
	{:else if $survey.phase === 't2'}
		<T2Aspiration
			aspiration={$survey.aspiration}
			finalForm={$survey.routing?.finalForm ?? false}
		/>
	{:else if $survey.phase === 't3' && $survey.horizon}
		<T3Horizon horizon={$survey.horizon} />
	{:else if $survey.phase === 'results'}
		<ResultsStub state={$survey} />
	{/if}
</main>

<style>
	main {
		max-width: 44rem;
		margin: 0 auto;
		padding: 2rem 1.25rem 4rem;
	}

	.brand {
		margin-bottom: 1.5rem;
	}

	.brand h1 {
		margin: 0;
		font-size: 1.75rem;
		letter-spacing: -0.02em;
	}

	.tagline {
		margin: 0.35rem 0 0;
		color: var(--muted);
		font-size: 0.95rem;
	}
</style>
