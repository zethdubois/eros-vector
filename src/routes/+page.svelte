<script lang="ts">
  import { onMount } from "svelte";
  import { betaMode } from "$lib/appMode";
  import { survey, hydrateSurvey } from "$lib/store";

  let ready = $state(false);

  onMount(() => {
    hydrateSurvey();
    ready = true;
  });

  const hasProgress = $derived(
    ready && ($survey.phase !== "intake" || $survey.intake !== null),
  );
  const ctaLabel = $derived(
    hasProgress
      ? betaMode
        ? "Continue beta survey"
        : "Continue mapping"
      : betaMode
        ? "Contribute to beta survey"
        : "Begin mapping",
  );

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
      <br />Map your Relational Trajectory.
    </h1>
    {#if ready}
      <a class="cta" href="/survey">{ctaLabel}</a>
    {/if}
    <div class="hero-bottom">
      <a class="hero-legal" href="/legal">Privacy &amp; Terms</a>
      <button type="button" class="scroll-cue" onclick={scrollToOverview}>
        <span>How it works</span>
        <span class="chevron" aria-hidden="true"></span>
      </button>
    </div>
  </section>

  <section id="overview" class="overview" aria-labelledby="overview-heading">
    <h2 id="overview-heading">How It Works</h2>
    <p class="lede">
      Answer a detailed survey to undersand how you navigate your relational
      desires throughout your life.
    </p>

    <div class="flow-wrap">
      <div class="flow" role="list">
        <div class="stage axes-stage" role="listitem">
          <p class="stage-label">Four orientations map you</p>
          <ul class="axis-list">
            <li>
              <span class="axis-glyph" data-axis="w" aria-hidden="true"></span>
              <strong>Architecture: Interdependent ↔ Autonomous</strong>
              <small>How do you build your life?</small>
            </li>
            <li>
              <span class="axis-glyph" data-axis="x" aria-hidden="true"></span>
              <strong>Drive: Recreational ↔ Romantic</strong>
              <small>Why are you connecting?</small>
            </li>
            <li>
              <span class="axis-glyph" data-axis="y" aria-hidden="true"></span>
              <strong>Permeability: Contained ↔ Permeable</strong>
              <small>How open is your relational world?</small>
            </li>
            <li>
              <span class="axis-glyph" data-axis="z" aria-hidden="true"></span>
              <strong>Method: Directed ↔ Organic</strong>
              <small>How does it actually happen?</small>
            </li>
          </ul>
        </div>

        <div class="connector" aria-hidden="true">
          <span class="line"></span>
          <span class="arrow"></span>
        </div>

        <div class="stage coords-stage" role="listitem">
          <p class="stage-label">Read your profile</p>
          <div class="plot-viz" aria-hidden="true">
            <!--
              Parallel coordinates — four vertical bipolar axes (W X Y Z).
              Centre (score = 0) = balanced. + pole at top, − at bottom.
              Axes (axes.md locked key):
                W = Architecture  + Interdependent / − Autonomous
                X = Drive         + Recreational   / − Romantic
                Y = Permeability  + Contained      / − Permeable
                Z = Method        + Directed       / − Organic
              Simulated result: Guarded Free Agent
                W(Architecture)=−1.5  X(Drive)=+1.8  Y(Permeability)=+1.6  Z(Method)=−1.7
                → Autonomous + Recreational + Contained + Organic
            -->
            <svg class="plot-svg" viewBox="0 0 240 168" role="img" aria-label="Parallel coordinates profile chart">
              <!-- vertical axis lines -->
              <g fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.32">
                <line x1="28" y1="18" x2="28" y2="145"/>
                <line x1="88" y1="18" x2="88" y2="145"/>
                <line x1="148" y1="18" x2="148" y2="145"/>
                <line x1="208" y1="18" x2="208" y2="145"/>
              </g>
              <!-- centre ticks (score = 0) -->
              <g stroke="currentColor" stroke-width="0.8" opacity="0.28">
                <line x1="23" y1="81" x2="33" y2="81"/>
                <line x1="83" y1="81" x2="93" y2="81"/>
                <line x1="143" y1="81" x2="153" y2="81"/>
                <line x1="203" y1="81" x2="213" y2="81"/>
              </g>
              <!-- + pole labels (top) -->
              <text x="28"  y="12" text-anchor="middle" font-size="5.5" fill="currentColor" opacity="0.55">Interdependent</text>
              <text x="88"  y="12" text-anchor="middle" font-size="5.5" fill="currentColor" opacity="0.55">Recreational</text>
              <text x="148" y="12" text-anchor="middle" font-size="5.5" fill="currentColor" opacity="0.55">Contained</text>
              <text x="208" y="12" text-anchor="middle" font-size="5.5" fill="currentColor" opacity="0.55">Directed</text>
              <!-- − pole labels (bottom) -->
              <text x="28"  y="155" text-anchor="middle" font-size="5.5" fill="currentColor" opacity="0.55">Autonomous</text>
              <text x="88"  y="155" text-anchor="middle" font-size="5.5" fill="currentColor" opacity="0.55">Romantic</text>
              <text x="148" y="155" text-anchor="middle" font-size="5.5" fill="currentColor" opacity="0.55">Permeable</text>
              <text x="208" y="155" text-anchor="middle" font-size="5.5" fill="currentColor" opacity="0.55">Organic</text>
              <!-- axis letter labels -->
              <text x="28"  y="166" text-anchor="middle" font-size="8" font-weight="600" fill="#9b7fe8">W</text>
              <text x="88"  y="166" text-anchor="middle" font-size="8" font-weight="600" fill="#9e7982">X</text>
              <text x="148" y="166" text-anchor="middle" font-size="8" font-weight="600" fill="#c4a574">Y</text>
              <text x="208" y="166" text-anchor="middle" font-size="8" font-weight="600" fill="#7a9e9a">Z</text>
              <!-- profile line: W−1.5→y=130  X+1.8→y=24  Y+1.6→y=30  Z−1.7→y=136 -->
              <polyline points="28,130 88,24 148,30 208,136"
                fill="none" stroke="#9e7982" stroke-width="2.2"
                stroke-linejoin="round" opacity="0.82"/>
              <!-- score dots (one per axis, colored) -->
              <circle cx="28"  cy="130" r="4.5" fill="#9b7fe8"/>
              <circle cx="88"  cy="24"  r="4.5" fill="#9e7982"/>
              <circle cx="148" cy="30"  r="4.5" fill="#c4a574"/>
              <circle cx="208" cy="136" r="4.5" fill="#7a9e9a"/>
            </svg>
            <p class="archetype-tag">Guarded Free Agent</p>
          </div>
          <p class="stage-caption">One of 16 named orientation profiles</p>
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
<!-- 
    <p class="closing">
      <em>Don’t just label.</em>
      <br /><br />
      <em>Understand your relational evolution.</em>
    </p> -->

    {#if ready}
      <p class="detail-cta">
        <a class="cta secondary" href="/survey">{ctaLabel}</a>
      </p>
    {/if}
  </section>

  <footer class="legal-footer">
    <a href="/legal">Privacy &amp; Terms</a>
  </footer>
</div>

<style>
  .splash {
    min-height: 100vh;
    min-height: 100dvh;
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
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 4.5rem 1.25rem 5.5rem;
    gap: 0.85rem;
    position: relative;
  }

  @media (min-width: 700px) {
    .hero {
      padding: 3rem 1.5rem 5.5rem;
    }
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

  .hero-bottom {
    position: absolute;
    bottom: 1.5rem;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .hero-legal {
    font-size: 0.85rem;
    font-weight: 500;
    color: color-mix(in srgb, var(--cream) 55%, transparent);
    text-decoration: underline;
    text-underline-offset: 0.18em;
    animation: rise 0.9s ease-out 0.35s both;
  }

  .hero-legal:hover {
    color: var(--cream);
  }

  .scroll-cue {
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
    overflow-x: visible;
    padding: 0.5rem 0 1.5rem;
  }

  .flow {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    width: 100%;
    max-width: min(72rem, 92vw);
    margin: 0 auto;
    padding: 0 clamp(1rem, 3vw, 2rem);
  }

  .stage {
    flex: none;
    width: 100%;
    min-width: 0;
    padding: clamp(1.25rem, 2.5vw, 1.75rem);
    border: 1px solid rgba(249, 246, 229, 0.14);
    border-radius: 12px;
    background: rgba(249, 246, 229, 0.04);
  }

  .connector {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    width: 2rem;
    padding: 0.45rem 0;
    align-self: center;
    transform: rotate(90deg);
  }

  @media (min-width: 700px) {
    .flow-wrap {
      overflow-x: auto;
      padding: 0.5rem clamp(1rem, 3vw, 2rem) 1.5rem;
      scroll-snap-type: x proximity;
      -webkit-overflow-scrolling: touch;
    }

    .flow {
      flex-direction: row;
      width: max-content;
      max-width: none;
      min-width: min(100%, 72rem);
      padding: 0;
    }

    .stage {
      flex: 1 1 clamp(16rem, 26vw, 22rem);
      width: auto;
      min-width: clamp(16rem, 50vw, 20rem);
      scroll-snap-align: start;
    }

    .connector {
      flex: 0 0 clamp(1.5rem, 3vw, 2.75rem);
      width: auto;
      padding: 0 0.15rem;
      transform: none;
    }
  }

  @media (min-width: 1100px) {
    .flow {
      width: 100%;
      max-width: 72rem;
      justify-content: space-between;
    }
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

  .axis-glyph[data-axis="w"] {
    background: #9b7fe8;
  }
  .axis-glyph[data-axis="x"] {
    background: var(--rose);
  }
  .axis-glyph[data-axis="y"] {
    background: #c4a574;
  }
  .axis-glyph[data-axis="z"] {
    background: #7a9e9a;
  }

  .coords-stage {
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

  .archetype-tag {
    margin: 0.65rem 0 0;
    text-align: center;
    font-family: "Fraunces", Georgia, serif;
    font-size: clamp(0.88rem, 1.6vw, 1rem);
    font-weight: 600;
    color: var(--cream);
    letter-spacing: 0.01em;
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
    min-width: 0;
  }

  @media (min-width: 700px) {
    .time-stage {
      min-width: clamp(16rem, 50vw, 20rem);
    }
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

  .legal-footer {
    padding: 2rem 1.25rem 2.5rem;
    text-align: center;
  }

  .legal-footer a {
    font-size: 0.85rem;
    font-weight: 500;
    color: color-mix(in srgb, var(--cream) 55%, transparent);
    text-decoration: underline;
    text-underline-offset: 0.18em;
  }

  .legal-footer a:hover {
    color: var(--cream);
  }

  @media (prefers-reduced-motion: reduce) {
    .mark,
    .brand,
    .hero h1,
    .cta,
    .hero-legal,
    .scroll-cue,
    .chevron,
    .traveler {
      animation: none;
    }
  }
</style>
