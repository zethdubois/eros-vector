<script lang="ts">
	import { deepDiveQuestions, quickVibeQuestions } from '$lib/questions';
	import { answerCount, scoreAnswers } from '$lib/scoring';
	import { resetSurvey, type SurveyState } from '$lib/store';
	import type { Coordinates } from '$lib/types';

	let { state }: { state: SurveyState } = $props();

	function fmt(c: Coordinates): string {
		return `x: ${c.x.toFixed(2)}, y: ${c.y.toFixed(2)}, z: ${c.z.toFixed(2)}`;
	}

	const rows = $derived.by(() => {
		const out: {
			label: string;
			coords: Coordinates;
			answers: number;
			shadow?: boolean;
		}[] = [];

		for (const era of state.eras) {
			out.push({
				label: `T0 · ${era.name || 'Untitled'} · Scouting`,
				coords: scoreAnswers(era.scouting, quickVibeQuestions),
				answers: answerCount(era.scouting)
			});
			out.push({
				label: `T0 · ${era.name || 'Untitled'} · Bound`,
				coords: scoreAnswers(era.bound, quickVibeQuestions),
				answers: answerCount(era.bound),
				shadow: era.shadow
			});
		}

		out.push({
			label: 'T1 · Present · Scouting',
			coords: scoreAnswers(state.present.scouting, deepDiveQuestions),
			answers: answerCount(state.present.scouting)
		});
		out.push({
			label: 'T1 · Present · Bound',
			coords: scoreAnswers(state.present.bound, deepDiveQuestions),
			answers: answerCount(state.present.bound),
			shadow: state.present.shadow
		});

		if (state.routing?.finalForm) {
			out.push({
				label: 'Final Form (T2+T3) · Bound',
				coords: scoreAnswers(state.aspiration, deepDiveQuestions),
				answers: answerCount(state.aspiration)
			});
		} else {
			out.push({
				label: 'T2 · Aspiration · Bound',
				coords: scoreAnswers(state.aspiration, deepDiveQuestions),
				answers: answerCount(state.aspiration)
			});
			if (state.horizon) {
				out.push({
					label: 'T3 · Horizon · Bound',
					coords: scoreAnswers(state.horizon, deepDiveQuestions),
					answers: answerCount(state.horizon)
				});
			}
		}

		return out;
	});
</script>

<section class="results">
	<h2>Results (stub)</h2>
	<p class="lede">
		Axis means from Likert→coordinate transform (−2…+2). 3D cube visualization comes next.
	</p>

	{#if state.intake && state.routing}
		<dl class="meta">
			<div>
				<dt>Chron age</dt>
				<dd>{state.intake.chronAge}</dd>
			</div>
			<div>
				<dt>Awake age</dt>
				<dd>{state.intake.awakeAge}</dd>
			</div>
			<div>
				<dt>Sex age</dt>
				<dd>{state.intake.sexAge}</dd>
			</div>
			<div>
				<dt>Unlocked</dt>
				<dd>
					{[
						state.routing.t0 && 'T0',
						'T1',
						state.routing.finalForm ? 'Final Form' : 'T2',
						state.routing.t3 && 'T3'
					]
						.filter(Boolean)
						.join(', ')}
				</dd>
			</div>
		</dl>
	{/if}

	<table>
		<thead>
			<tr>
				<th>Pass</th>
				<th>Coordinates</th>
				<th>Answers</th>
				<th>Shadow</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row}
				<tr>
					<td>{row.label}</td>
					<td><code>{fmt(row.coords)}</code></td>
					<td>{row.answers}</td>
					<td>{row.shadow ? 'Yes' : row.shadow === false ? 'No' : '—'}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<button type="button" onclick={() => {
		if (confirm('Clear all survey progress and start over?')) resetSurvey();
	}}>Restart</button>
</section>

<style>
	.results h2 {
		margin: 0 0 0.5rem;
	}

	.lede {
		color: var(--muted);
		margin: 0 0 1.5rem;
		max-width: 40rem;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 1.5rem;
		margin: 0 0 1.5rem;
	}

	.meta div {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.meta dt {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--muted);
	}

	.meta dd {
		margin: 0;
		font-weight: 600;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
	}

	th,
	td {
		text-align: left;
		padding: 0.55rem 0.65rem;
		border-bottom: 1px solid var(--border);
		vertical-align: top;
	}

	th {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--muted);
		font-weight: 600;
	}

	code {
		font-size: 0.85rem;
	}

	button {
		padding: 0.65rem 1.25rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		color: var(--text);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
	}
</style>
