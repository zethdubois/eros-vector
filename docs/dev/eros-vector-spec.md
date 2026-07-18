# Eros Vector - Product & Technical Specification

## 1. Project Overview

**Name:** Eros Vector
**Repo Name:** `eros-vector`
**Tagline:** A 4D relationship mapping tool. Plots relational orientation across 3 spatial axes and adds Time as the 4th dimension. Reveals trajectories and friction gaps, not just static labels.
**Core Concept:** Users complete a dynamic survey based on their "Sex-Age." The tool maps their Past, Present, Aspiration, and Horizon, generating a 3D cube visualization with plotted vectors showing their relational evolution. It differentiates between "Scouting" (single/seeking) and "Bound" (pair-bonded) operating modes.

## 2. The 3D Coordinate System (The Core Engine)

The tool maps users on three bipolar axes. Scoring is based on a 5-point Likert scale (1=Strongly Disagree, 5=Strongly Agree).

- **Y-Axis: Structure (+Y) vs. Autonomy (-Y)**
  - _High +Y:_ Hierarchical Anchor, Monogamish, merged logistics.
  - _High -Y:_ Solo Poly, Relationship Anarchy, strict independence.
- **X-Axis: Eroticism (+X) vs. Emotional Depth (-X)**
  - _High +X:_ Recreational play, swinging, casual sexual variety — erotic drive outward.
  - _High -X:_ Egalitarian Poly, Pragmatic Polycule, chosen family, strict monogamy.
- **Z-Axis: Intentional (+Z) vs. Organic (-Z)**
  - _High +Z:_ App-driven, explicit rules, scheduled quests, lifestyle clubs, strict monogamous boundaries.
  - _High -Z:_ Permissive tribes, spontaneous eruption, pragmatic evolution.

**Scoring Math:**
Transform 1-5 scale to -2 to +2 for coordinate plotting.

- 1 = -2 (Strong pull to negative pole)
- 2 = -1
- 3 = 0
- 4 = +1
- 5 = +2 (Strong pull to positive pole)

## 3. Intake Logic & Routing (The 4th Axis: Time)

**Inputs:**

- `chron_age` (Current Age)
- `awake_age` (Age sexually/romantically active)
- `sex_age` = `chron_age` - `awake_age`

**Routing Rules:**

- **T0 (Past Eras):** IF `sex_age` > 3, unlock T0. ELSE skip.
- **T1 (Present):** ALWAYS unlock.
- **T2 (Aspiration):** ALWAYS unlock.
- **T3 (Horizon):** IF `chron_age` < 55, unlock T3. IF `chron_age` >= 55, merge T2/T3 (Final Form).

## 4. The Dual-Mode System (Scouting vs. Bound)

Users operate differently when single vs. pair-bonded. The survey captures this duality.

**Definitions:**

- **Scouting Mode:** Unbound, single, casually dating, seeking. (The "Search Pattern").
- **Bound Mode:** Pair-bonded, heightened commitment status. (Must meet 1 of 3 criteria: Explicit Status, Behavioral Sacrifice, or Logistical Merge).
- **Shadow Tag:** Optional modifier for Bound Mode. "Did you secretly operate outside the agreements (cheating)?" Adds a visual fracture to the dot.

**Application Rules:**

- **T0 & T1:** User answers questions TWICE per era/present (Once for Scouting, Once for Bound).
- **T2 & T3:** User answers questions ONCE (Aspirational architecture is inherently Bound).

**Crucial Survey Prompting Logic:**
To ensure monogamous users can accurately answer the X and Z axes in Bound mode, questions must be framed around **Orientation/Desire** rather than **Current Behavior**.

- _Scouting Prompt:_ "Answer based on how you operate and what you seek when single/unbound."
- _Bound Prompt:_ "Answer based on your ideal bond structure and boundaries, even if you are currently single."

## 5. Survey Flow & UI Logic

### Phase 1: Intake

Collect `chron_age` and `awake_age`. Calculate routing.

### Phase 2: T0 - The Storyline (Quick Vibe Check)

- **UI:** Allow users to create custom "Era" names (e.g., "The College Years", "First Marriage"). Max 4 eras.
- **Questions per Era:** 3 Quick Vibe questions (1 per axis).
- **Modes per Era:** Answered twice (Scouting + Bound).
- **Total questions per Era:** 6. (Very fast to prevent fatigue).

### Phase 3: T1 - Present (Deep Dive)

- **Questions:** 15 Core Engine questions (5 per axis).
- **Modes:** Answered twice (Scouting + Bound).
- **Total questions:** 30.

### Phase 4: T2 - Aspiration (Deep Dive)

- **Questions:** 15 Core Engine questions.
- **Modes:** Answered once (Bound only).
- **Total questions:** 15.

### Phase 5: T3 - Horizon (Deep Dive)

- **Questions:** 15 Core Engine questions.
- **Modes:** Answered once (Bound only).
- **Total questions:** 15.

## 6. Question Banks

### Quick Vibe Check (Used for T0 Eras)

- **Y-Check:** I envision my ideal life having a central "home base" partner or anchor, rather than keeping my living and financial life entirely my own.
- **X-Check:** I want the freedom to pursue sexual variety and erotic energy with others, rather than keeping all sexual energy contained exclusively within one core bond.
- **Z-Check:** I prefer my relationships to operate with explicitly negotiated rules and boundaries (even if the rule is strict exclusivity), rather than fluid, unspoken social vibes.

### Deep Dive Core Engine (Used for T1, T2, T3)

_(All phrased so 5 = Strongest pull to Positive Pole. Phrased to capture Orientation/Desire so they work for both Scouting and Bound modes, including strict monogamy.)_

**Y-Axis (Structure +Y vs Autonomy -Y)**

1. I envision my ideal life having a central "home base" partner or anchor, rather than keeping my living and financial life entirely my own.
2. I believe it is natural and ethical for one relationship to hold clear priority in my life decisions over others.
3. I imagine wanting to deeply merge my logistics (finances, housing, family building) with a partner, rather than maintaining strict logistical independence.
4. I envision my ideal relationship architecture having a central, prioritized partnership, with other connections playing more peripheral roles.
5. I see the "couple" as the fundamental unit of my relational life, rather than the "individual."

**X-Axis (Eroticism +X vs Emotional Depth -X)**

1. I want the freedom to pursue sexual variety and erotic energy with others, rather than keeping all sexual energy contained exclusively within one core bond.
2. I view sexual play with others primarily as a recreational enhancement to life, rather than a path to building deeply intertwined emotional lives.
3. I am drawn to the idea of group or "moresome" energy primarily for the physical/erotic thrill, rather than for the emotional intimacy of a chosen family.
4. I believe relationships are best when they serve the purpose of mutual pleasure and play, rather than needing to serve the practical realities of life (co-parenting, shared resources).
5. I imagine I would be more fulfilled by a wide variety of casual/playful sexual connections than by a few deeply emotionally integrated ones.

**Z-Axis (Intentional +Z vs Organic -Z)**

1. I prefer to find and manage connections through intentional design (apps, explicit boundaries, scheduled quests), rather than letting them erupt organically from permissive social circles.
2. I prefer to rely on explicitly negotiated rules and boundaries regarding outside interactions (even if the rule is strict exclusivity), rather than fluid, unspoken social vibes.
3. I believe relational structures work best as a scheduled, defined activity, rather than something that spontaneously happens when the vibe is right.
4. I prefer relationships to stay true to their original intent (e.g., a play partner stays a play partner; a monogamous bond stays monogamous), rather than letting them organically evolve far beyond their starting point.
5. I am someone who designs my relationship structure from a blueprint, rather than letting it grow like a garden based on who we meet and what the situation requires.

## 7. Data Visualization Spec (The Output)

Render a 3D interactive cube (using Three.js, Babylon.js, or similar).

**Dot Types:**

- **T0 (Eras):** Small dots.
- **T1 (Present):** Large solid dots.
- **T2 (Aspiration):** Bright target dots.
- **T3 (Horizon):** Glowing/final dots.

**Dot Shapes/Modifiers:**

- **Circle:** Scouting Mode.
- **Square:** Bound Mode.
- **Fracture/Red Outline:** Bound Mode + Shadow Tag (Cheating/Agreement breaking).

**Vectors (Lines):**

- Connect Scouting dots chronologically (The Scouting Trajectory).
- Connect Bound dots chronologically (The Architecture Trajectory).
- **Friction Gap:** Highlight the distance between T1 (Present) and T2 (Aspiration) with a dashed line. Large distance = high dissatisfaction/desire for change.

**Diagnostic Readout (Text):**
Generate a text summary based on coordinates. E.g., "You are currently an Anchored Team Player, but your Aspiration vector points toward Tribal Erotic. You are seeking more organic, playful emergence."
