<script lang="ts">
  import { onMount } from "svelte";
  import { survey, hydrateSurvey } from "$lib/store";

  let ready = $state(false);

  onMount(() => {
    hydrateSurvey();
    ready = true;
  });

  const hasProgress = $derived(
    ready && ($survey.phase !== "intake" || $survey.intake !== null),
  );
  const ctaLabel = $derived(hasProgress ? "Continue mapping" : "Begin mapping");

  function scrollToOverview() {
    document.getElementById("overview")?.scrollIntoView({ behavior: "smooth" });
  }
</script>

<div class="splash">
  <section class="hero">
    <img
      class="mark"
      src="/img/eros-icon.png"
      alt="Eros Vector mark — serif E drawn as a bow with rose fletching"
      width="200"
      height="200"
    />
    <p class="brand">Eros Vector</p>
    <h1>
      You aren't a label.<br /><br />Map your Relational Trajectory.
    </h1>
    {#if ready}
      <a class="cta" href="/survey">{ctaLabel}</a>
    {/if}
    <button type="button" class="scroll-cue" onclick={scrollToOverview}>
      <span>How it works</span>
      <span class="chevron" aria-hidden="true"></span>
    </button>
  </section>

  <section id="overview" class="overview" aria-labelledby="overview-heading">
    <h2 id="overview-heading">How It Works</h2>
    <p class="lede">
      Answer a detailed survey, then find your home on the map. Watch how that
      place shifts across your life.
    </p>

    <div class="flow-wrap">
      <div class="flow" role="list">
        <div class="stage axes-stage" role="listitem">
          <p class="stage-label">Three domains orient you</p>
          <ul class="axis-list">
            <li>
              <span class="axis-glyph" data-axis="y" aria-hidden="true"></span>
              <strong>Structure ↔ Autonomy</strong>
              <small>How tightly you bond</small>
            </li>
            <li>
              <span class="axis-glyph" data-axis="x" aria-hidden="true"></span>
              <strong>Eroticism ↔ Depth</strong>
              <small>What draws you to others</small>
            </li>
            <li>
              <span class="axis-glyph" data-axis="z" aria-hidden="true"></span>
              <strong>Intentional ↔ Organic</strong>
              <small>How connections happen</small>
            </li>
          </ul>
        </div>

        <div class="connector" aria-hidden="true">
          <span class="line"></span>
          <span class="arrow"></span>
        </div>

        <div class="stage cube-stage" role="listitem">
          <p class="stage-label">Map your coordinates</p>
          <div class="plot-viz" aria-hidden="true">
            <!-- Cabinet @ 30°: square front face, depth ×0.5 (less stretch) -->
            <svg class="plot-svg" viewBox="32 39 136 122" role="img">
              <g fill="none" stroke="currentColor" stroke-linejoin="round">
                <g stroke-width="1.6">
                  <path d="M78 148 L156 148 L156 70 L78 70 Z" opacity="0.75" />
                  <path
                    d="M78 70 L44.2 50.5 L122.2 50.5 L156 70"
                    opacity="0.75"
                  />
                  <path
                    d="M78 148 L44.2 128.5 L44.2 50.5 L78 70"
                    opacity="0.75"
                  />
                  <path d="M156 148 L122.2 128.5 L44.2 128.5" opacity="0.28" />
                  <path
                    d="M156 148 L122.2 128.5 L122.2 50.5 L156 70"
                    opacity="0.28"
                  />
                </g>
                <!-- Floor (y=0): ∥ X then ∥ Z; then vertical ∥ Y -->
                <g
                  stroke-width="2"
                  stroke-dasharray="4 5"
                  stroke-linecap="round"
                >
                  <line class="axis-x" x1="78" y1="148" x2="126.4" y2="148" />
                  <line
                    class="axis-z"
                    x1="126.4"
                    y1="148"
                    x2="111.2"
                    y2="139.2"
                  />
                  <line
                    class="axis-z"
                    x1="78"
                    y1="148"
                    x2="62.8"
                    y2="139.2"
                    opacity="0.4"
                  />
                  <line
                    class="axis-x"
                    x1="62.8"
                    y1="139.2"
                    x2="111.2"
                    y2="139.2"
                    opacity="0.4"
                  />
                  <line
                    class="axis-y"
                    x1="111.2"
                    y1="139.2"
                    x2="111.2"
                    y2="101.8"
                  />
                </g>
              </g>
              <circle
                class="plot-point"
                cx="111.2"
                cy="101.8"
                r="5.5"
                fill="currentColor"
              />
            </svg>
            <aside class="callout">
              <span class="callout-label">Anchored Team Player</span>
            </aside>
          </div>
          <p class="stage-caption">A plain-language name for that place</p>
        </div>

        <div class="connector" aria-hidden="true">
          <span class="line"></span>
          <span class="arrow"></span>
        </div>

        <div class="stage time-stage" role="listitem">
          <p class="stage-label">Visualize your evolution</p>
          <div class="timeline" aria-hidden="true">
            <div class="rail">
              <span class="tick"><em>Past</em></span>
              <span class="tick"><em>Now</em></span>
              <span class="tick"><em>Want</em></span>
              <span class="tick"><em>Horizon</em></span>
            </div>
            <div class="traveler">
              <span class="mini-point"></span>
            </div>
          </div>
          <p class="stage-caption">
            How you’ve changed — and where you’re headed
          </p>
        </div>
      </div>
    </div>

    <aside class="modes-panel">
      <h3>Two ways of operating</h3>
      <div class="modes-grid">
        <div class="mode-card scouting">
          <h4>Scouting</h4>
          <p>
            When you’re unbound — single, seeking, casually dating. Your search
            pattern.
          </p>
        </div>
        <div class="mode-card bound">
          <h4>Bound</h4>
          <p>
            When you’re pair-bonded. Your architecture — including exclusive
            monogamy, open structures, or anything in between.
          </p>
        </div>
      </div>
    </aside>

    <p class="closing">
      <em>Don’t diagnose</em>
      <br /><br />
      <em>Understand your relational evolution.</em>
    </p>

    {#if ready}
      <p class="detail-cta">
        <a class="cta secondary" href="/survey">{ctaLabel}</a>
      </p>
    {/if}
  </section>
</div>

<style>
  .splash {
    min-height: 100vh;
    color: var(--cream);
    background: radial-gradient(
        ellipse 70% 55% at 50% -5%,
        rgba(158, 121, 130, 0.28),
        transparent 60%
      ),
      radial-gradient(
        ellipse 50% 40% at 100% 80%,
        rgba(249, 246, 229, 0.06),
        transparent 50%
      ),
      var(--navy);
  }

  .hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 3rem 1.5rem 5.5rem;
    gap: 0.85rem;
    position: relative;
  }

  .mark {
    width: min(42vw, 200px);
    height: auto;
    border-radius: 50%;
    margin-bottom: 0.5rem;
    animation: rise 0.9s ease-out both;
  }

  .brand {
    margin: 0;
    font-family: "Fraunces", Georgia, serif;
    font-size: clamp(1.75rem, 5vw, 2.35rem);
    font-weight: 700;
    letter-spacing: 0.02em;
    animation: rise 0.9s ease-out 0.08s both;
  }

  .hero h1 {
    margin: 0.35rem 0 0.5rem;
    max-width: 18ch;
    font-family: "Fraunces", Georgia, serif;
    font-size: clamp(1.35rem, 3.8vw, 1.85rem);
    font-weight: 500;
    line-height: 1.25;
    color: var(--cream);
    animation: rise 0.9s ease-out 0.16s both;
  }

  .cta {
    display: inline-block;
    margin-top: 0.5rem;
    padding: 0.85rem 1.6rem;
    border-radius: 8px;
    background: var(--cream);
    color: var(--navy);
    font-weight: 600;
    text-decoration: none;
    letter-spacing: 0.01em;
    transition:
      transform 0.2s ease,
      background 0.2s ease;
    animation: rise 0.9s ease-out 0.24s both;
  }

  .cta:hover {
    transform: translateY(-2px);
    background: #fff;
  }

  .cta.secondary {
    animation: none;
  }

  .scroll-cue {
    position: absolute;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.75rem;
    border: none;
    background: transparent;
    color: color-mix(in srgb, var(--cream) 70%, transparent);
    font-size: 0.8rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    animation: rise 0.9s ease-out 0.4s both;
  }

  .chevron {
    width: 10px;
    height: 10px;
    border-right: 1.5px solid currentColor;
    border-bottom: 1.5px solid currentColor;
    transform: rotate(45deg);
    animation: bob 1.6s ease-in-out infinite;
  }

  .overview {
    padding: clamp(3rem, 8vh, 5.5rem) 0 clamp(4rem, 10vh, 6.5rem);
    border-top: 1px solid rgba(249, 246, 229, 0.12);
  }

  .overview h2,
  .lede,
  .modes-panel,
  .closing,
  .detail-cta {
    max-width: min(72rem, 92vw);
    margin-left: auto;
    margin-right: auto;
    padding-left: clamp(1rem, 3vw, 2rem);
    padding-right: clamp(1rem, 3vw, 2rem);
  }

  .overview h2 {
    margin-top: 0;
    margin-bottom: 0.85rem;
    font-family: "Fraunces", Georgia, serif;
    font-size: clamp(1.75rem, 4vw, 2.4rem);
    font-weight: 600;
  }

  .lede {
    margin-top: 0;
    margin-bottom: clamp(1.75rem, 4vh, 2.75rem);
    max-width: 40rem;
    font-size: clamp(1.05rem, 2.2vw, 1.25rem);
    color: color-mix(in srgb, var(--cream) 78%, transparent);
    line-height: 1.6;
  }

  .flow-wrap {
    overflow-x: auto;
    padding: 0.5rem clamp(1rem, 3vw, 2rem) 1.5rem;
    scroll-snap-type: x proximity;
    -webkit-overflow-scrolling: touch;
  }

  .flow {
    display: flex;
    align-items: stretch;
    gap: 0;
    width: max-content;
    min-width: min(100%, 72rem);
    margin: 0 auto;
  }

  @media (min-width: 1100px) {
    .flow {
      width: 100%;
      max-width: 72rem;
      justify-content: space-between;
    }
  }

  .stage {
    flex: 1 1 clamp(16rem, 26vw, 22rem);
    min-width: clamp(16rem, 70vw, 20rem);
    padding: clamp(1.25rem, 2.5vw, 1.75rem);
    border: 1px solid rgba(249, 246, 229, 0.14);
    border-radius: 12px;
    background: rgba(249, 246, 229, 0.04);
    scroll-snap-align: start;
  }

  .stage-label {
    margin: 0 0 1.15rem;
    font-size: clamp(0.78rem, 1.4vw, 0.9rem);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--rose);
    line-height: 1.35;
  }

  .stage-caption {
    margin: 1.15rem 0 0;
    font-size: clamp(0.9rem, 1.6vw, 1.05rem);
    color: color-mix(in srgb, var(--cream) 65%, transparent);
    text-align: center;
  }

  .connector {
    display: flex;
    align-items: center;
    flex: 0 0 clamp(1.5rem, 3vw, 2.75rem);
    padding: 0 0.15rem;
    align-self: center;
  }

  .connector .line {
    flex: 1;
    height: 1px;
    background: color-mix(in srgb, var(--cream) 35%, transparent);
  }

  .connector .arrow {
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-left: 8px solid color-mix(in srgb, var(--cream) 55%, transparent);
  }

  .axis-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: clamp(0.85rem, 2vh, 1.15rem);
  }

  .axis-list li {
    display: grid;
    grid-template-columns: 1.15rem 1fr;
    grid-template-rows: auto auto;
    column-gap: 0.65rem;
    row-gap: 0.15rem;
    align-items: center;
  }

  .axis-list strong {
    font-size: clamp(1rem, 1.8vw, 1.15rem);
    font-weight: 600;
    grid-column: 2;
  }

  .axis-list small {
    grid-column: 2;
    font-size: clamp(0.88rem, 1.5vw, 1rem);
    color: color-mix(in srgb, var(--cream) 60%, transparent);
  }

  .axis-glyph {
    grid-row: 1 / span 2;
    width: 0.9rem;
    height: 0.9rem;
    border-radius: 2px;
    background: var(--rose);
  }

  .axis-glyph[data-axis="y"] {
    background: #c4a574;
  }
  .axis-glyph[data-axis="x"] {
    background: var(--rose);
  }
  .axis-glyph[data-axis="z"] {
    background: #7a9e9a;
  }

  .cube-stage {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .plot-viz {
    position: relative;
    width: clamp(14rem, 32vw, 20rem);
    margin: 0.35rem auto 0;
  }

  .plot-svg {
    display: block;
    width: 100%;
    height: auto;
    color: var(--cream);
  }

  .axis-x {
    stroke: var(--rose);
  }
  .axis-y {
    stroke: #c4a574;
  }
  .axis-z {
    stroke: #7a9e9a;
  }

  .plot-point {
    filter: drop-shadow(
      0 0 6px color-mix(in srgb, var(--rose) 70%, transparent)
    );
    animation: pulse-dot 2.4s ease-in-out infinite;
  }

  .callout {
    position: absolute;
    right: 4%;
    top: 12%;
    max-width: 8.5rem;
    padding: 0.5rem 0.65rem;
    border: 1px solid color-mix(in srgb, var(--cream) 30%, transparent);
    border-radius: 6px;
    background: color-mix(in srgb, var(--navy) 88%, var(--cream));
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  }

  .callout::before {
    content: "";
    position: absolute;
    left: -5px;
    bottom: 0.7rem;
    width: 8px;
    height: 8px;
    border-left: 1px solid color-mix(in srgb, var(--cream) 30%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--cream) 30%, transparent);
    background: inherit;
    transform: rotate(45deg);
  }

  .callout-label {
    display: block;
    font-family: "Fraunces", Georgia, serif;
    font-size: clamp(0.8rem, 1.5vw, 0.95rem);
    font-weight: 600;
    line-height: 1.25;
    color: var(--cream);
  }

  .mini-point {
    display: block;
    width: 0.85rem;
    height: 0.85rem;
    border-radius: 50%;
    background: var(--cream);
    box-shadow: 0 0 8px color-mix(in srgb, var(--rose) 70%, transparent);
  }

  .timeline {
    position: relative;
    margin-top: 1.5rem;
    padding: 0 0.25rem 2rem;
  }

  .rail {
    display: flex;
    justify-content: space-between;
    gap: 0.35rem;
    padding-top: 1rem;
    border-top: 1px solid color-mix(in srgb, var(--cream) 35%, transparent);
  }

  .tick {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    font-size: clamp(0.75rem, 1.4vw, 0.88rem);
    color: color-mix(in srgb, var(--cream) 62%, transparent);
    position: relative;
  }

  .tick::before {
    content: "";
    position: absolute;
    top: -1rem;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--cream) 55%, transparent);
    transform: translateY(-50%);
  }

  .tick em {
    font-style: normal;
    font-weight: 600;
    color: var(--cream);
    font-size: clamp(0.85rem, 1.6vw, 1rem);
  }

  .traveler {
    position: absolute;
    top: -0.2rem;
    left: 0;
    animation: travel 7s ease-in-out infinite;
  }

  .time-stage {
    min-width: clamp(16rem, 70vw, 20rem);
  }

  .modes-panel {
    margin-top: clamp(2.5rem, 6vh, 3.5rem);
    padding: clamp(1.35rem, 3vw, 1.85rem) clamp(1.25rem, 3vw, 1.75rem);
    border: 1px solid color-mix(in srgb, var(--rose) 45%, transparent);
    border-radius: 12px;
    background: linear-gradient(
        135deg,
        rgba(158, 121, 130, 0.18),
        rgba(249, 246, 229, 0.04)
      ),
      rgba(15, 17, 26, 0.55);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  }

  .modes-panel h3 {
    margin: 0 0 1.15rem;
    font-family: "Fraunces", Georgia, serif;
    font-size: clamp(1.25rem, 2.5vw, 1.55rem);
    font-weight: 600;
  }

  .modes-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 700px) {
    .modes-grid {
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }
  }

  .mode-card {
    padding: 1rem 1.1rem;
    border-radius: 8px;
    background: rgba(249, 246, 229, 0.06);
    border-left: 3px solid var(--rose);
  }

  .mode-card.scouting {
    border-left-color: #7a9e9a;
  }

  .mode-card.bound {
    border-left-color: var(--rose);
  }

  .mode-card h4 {
    margin: 0 0 0.4rem;
    font-size: clamp(1.05rem, 2vw, 1.2rem);
    font-weight: 600;
  }

  .mode-card p {
    margin: 0;
    font-size: clamp(0.95rem, 1.7vw, 1.05rem);
    line-height: 1.55;
    color: color-mix(in srgb, var(--cream) 78%, transparent);
  }

  .closing {
    margin-top: clamp(2rem, 5vh, 2.75rem) !important;
    font-family: "Fraunces", Georgia, serif;
    font-size: clamp(1.15rem, 2.5vw, 1.35rem);
    color: var(--cream) !important;
    text-align: center;
  }

  .detail-cta {
    margin-top: 1.75rem !important;
    text-align: center;
  }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes bob {
    0%,
    100% {
      transform: rotate(45deg) translateY(0);
    }
    50% {
      transform: rotate(45deg) translateY(4px);
    }
  }

  @keyframes pulse-dot {
    0%,
    100% {
      opacity: 0.8;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes travel {
    0% {
      left: 2%;
    }
    25% {
      left: 28%;
    }
    50% {
      left: 55%;
    }
    75% {
      left: 78%;
    }
    100% {
      left: 2%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mark,
    .brand,
    .hero h1,
    .cta,
    .scroll-cue,
    .chevron,
    .plot-point,
    .traveler {
      animation: none;
    }
  }
</style>
