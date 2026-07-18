<script lang="ts">
  import { onMount } from "svelte";
  import { survey, resetSurvey, hydrateSurvey } from "$lib/store";
  import ProgressBar from "$lib/components/ProgressBar.svelte";
  import IntakeForm from "$lib/components/IntakeForm.svelte";
  import T0Eras from "$lib/components/T0Eras.svelte";
  import T1Present from "$lib/components/T1Present.svelte";
  import T2Aspiration from "$lib/components/T2Aspiration.svelte";
  import T3Horizon from "$lib/components/T3Horizon.svelte";
  import PhaseBillboard from "$lib/components/PhaseBillboard.svelte";
  import Results from "$lib/components/Results.svelte";

  let ready = $state(false);

  onMount(() => {
    hydrateSurvey();
    ready = true;
  });

  const canRestart = $derived(
    $survey.phase !== "intake" || $survey.intake !== null,
  );

  function onRestart() {
    if (!canRestart) return;
    if (!confirm("Clear all survey progress and start over?")) return;
    resetSurvey();
  }
</script>

<main>
  <header class="brand">
    <div class="brand-row">
      <a class="home" href="/">
        <img src="/img/eros-icon.png" alt="" width="40" height="40" />
        <div>
          <h1>Eros Vector</h1>
          <!-- <p class="tagline">4D relationship mapping</p> -->
        </div>
      </a>
      {#if ready && canRestart}
        <button type="button" class="restart" onclick={onRestart}
          >Restart</button
        >
      {/if}
    </div>
  </header>

  {#if ready}
    <ProgressBar state={$survey} />

    <div class="phase">
      {#if $survey.phase === "intake"}
        <IntakeForm />
      {:else if $survey.phase === "t0"}
        <T0Eras eras={$survey.eras} questionSeed={$survey.questionSeed} />
      {:else if $survey.phase === "pause-t0" || $survey.phase === "pause-t1" || $survey.phase === "pause-t2" || $survey.phase === "pause-t3"}
        <PhaseBillboard state={$survey} />
      {:else if $survey.phase === "t1"}
        <T1Present
          present={$survey.present}
          questionSeed={$survey.questionSeed}
        />
      {:else if $survey.phase === "t2"}
        <T2Aspiration
          aspiration={$survey.aspiration}
          finalForm={$survey.routing?.finalForm ?? false}
          questionSeed={$survey.questionSeed}
        />
      {:else if $survey.phase === "t3" && $survey.horizonIncluded !== false}
        <T3Horizon
          horizon={$survey.horizon ?? {}}
          questionSeed={$survey.questionSeed}
        />
      {:else if $survey.phase === "complete"}
        <Results state={$survey} />
      {/if}
    </div>
  {/if}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    max-width: 44rem;
    margin: 0 auto;
    padding: 3.75rem 1rem 2rem;
    min-height: 100vh;
    min-height: 100dvh;
    box-sizing: border-box;
    background: radial-gradient(
        ellipse 80% 50% at 10% -10%,
        #e8efe9 0%,
        transparent 55%
      ),
      radial-gradient(ellipse 60% 40% at 100% 0%, #efe8e0 0%, transparent 50%),
      var(--bg);
  }

  @media (min-width: 700px) {
    main {
      padding: 2rem 1.25rem 2rem;
    }
  }

  .phase {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    width: 100%;
  }

  .brand {
    flex-shrink: 0;
    margin-bottom: 1.25rem;
  }

  .brand-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    /* Clear fixed Key button (top-right) */
    padding-right: 4.25rem;
  }

  @media (min-width: 700px) {
    .brand-row {
      padding-right: 11.5rem;
      gap: 1rem;
    }
  }

  .home {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    text-decoration: none;
    color: inherit;
    min-width: 0;
  }

  .home img {
    border-radius: 50%;
    flex-shrink: 0;
    width: 36px;
    height: 36px;
  }

  @media (min-width: 700px) {
    .home {
      gap: 0.75rem;
    }

    .home img {
      width: 40px;
      height: 40px;
    }
  }

  .brand h1 {
    margin: 0;
    font-family: "Fraunces", Georgia, serif;
    font-size: 1.45rem;
    letter-spacing: -0.02em;
  }

  @media (min-width: 700px) {
    .brand h1 {
      font-size: 1.75rem;
    }
  }

  .tagline {
    margin: 0.2rem 0 0;
    color: var(--muted);
    font-size: 0.95rem;
  }

  .restart {
    flex-shrink: 0;
    padding: 0.45rem 0.75rem;
    min-height: 2.5rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--surface);
    color: var(--text);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
  }

  .restart:hover {
    border-color: var(--danger);
    color: var(--danger);
  }
</style>
