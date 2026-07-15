<script lang="ts">
	import { validateIntake } from '$lib/routing';
	import { submitIntake, survey } from '$lib/store';

	let chronAge = $state<number | null>(null);
	let awakeAge = $state<number | null>(null);
	let error = $state<string | null>(null);

	$effect(() => {
		if ($survey.intake) {
			chronAge = $survey.intake.chronAge;
			awakeAge = $survey.intake.awakeAge;
		}
	});

	function onSubmit(e: Event) {
		e.preventDefault();
		const err = validateIntake(chronAge, awakeAge);
		if (err || chronAge === null || awakeAge === null) {
			error = err ?? 'Invalid input.';
			return;
		}
		error = null;
		submitIntake(chronAge, awakeAge);
	}
</script>

<section class="intake">
	<h2>Intake</h2>
	<p class="lede">
		We'll use your ages to unlock which time layers to map — Past eras, Present, Aspiration, and
		Horizon.
	</p>

	<form onsubmit={onSubmit}>
		<label>
			<span>Current age (chronological)</span>
			<input
				type="number"
				min="1"
				step="1"
				bind:value={chronAge}
				required
			/>
		</label>
		<label>
			<span>Awake age (when you became sexually / romantically active)</span>
			<input
				type="number"
				min="1"
				step="1"
				bind:value={awakeAge}
				required
			/>
		</label>

		{#if error}
			<p class="error" role="alert">{error}</p>
		{/if}

		<button type="submit">Continue</button>
	</form>
</section>

<style>
	.intake h2 {
		margin: 0 0 0.5rem;
	}

	.lede {
		color: var(--muted);
		margin: 0 0 1.5rem;
		max-width: 36rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		max-width: 24rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		font-size: 0.95rem;
	}

	input {
		padding: 0.6rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		font-size: 1rem;
		background: var(--surface);
		color: var(--text);
	}

	.error {
		color: var(--danger);
		margin: 0;
		font-size: 0.9rem;
	}

	button {
		align-self: flex-start;
		padding: 0.65rem 1.25rem;
		border: none;
		border-radius: 6px;
		background: var(--accent);
		color: #fff;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
	}

	button:hover {
		filter: brightness(1.05);
	}
</style>
