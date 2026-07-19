Here is the updated, comprehensive specification document. It integrates the 4th spatial axis (Permeability), updates the X-axis to "Recreational vs. Romantic," expands the archetypes to 16, and shifts the visualization spec to a Radar/Constellation model.

---

# Eros Vector - Product & Technical Specification (v2.0)

## 1. Project Overview

**Name:** Eros Vector
**Repo Name:** `eros-vector`
**Tagline:** A 4D relationship mapping tool. Plots relational orientation across 4 spatial axes and adds Time as a 5th dimension. Reveals trajectories and friction gaps, not just static labels.
**Core Concept:** Users complete a dynamic survey based on their "Sex-Age." The tool maps their Past, Present, Aspiration, and Horizon, generating a multi-dimensional visualization with plotted vectors showing their relational evolution. It differentiates between "Scouting" (single/seeking) and "Bound" (pair-bonded) operating modes, and captures the full spectrum of monogamy to non-monogamy.

## 2. The 4D Coordinate System (The Core Engine)

The tool maps users on four bipolar spatial axes. Scoring is based on a 5-point Likert scale (1=Strongly Disagree, 5=Strongly Agree).

- **W-Axis: Permeability (Exclusive vs. Open)**
  - _Question:_ How closed is your bond?
  - _High +W (Exclusive):_ Strict monogamy, closed polyamory, steel-wall boundaries.
  - _High -W (Open):_ Open boundaries, free passage for outside play/romance, fluid integration.
- **X-Axis: Drive (Recreational vs. Romantic)**
  - _Question:_ Why are you connecting outside?
  - _High +X (Recreational):_ Sexual variety, sport, erotic thrill, kept "in the dark."
  - _High -X (Romantic):_ Emotional integration, chosen family, deep bonding, brought "into the light."
- **Y-Axis: Architecture (Interdependent vs. Autonomous)**
  - _Question:_ How do you build your life?
  - _High +Y (Interdependent):_ Merged, anchored, unit-centric, prioritized.
  - \_High -Y (Autonomous):\* Independent, solo, individual-centric, sovereign.
- **Z-Axis: Method (Directed vs. Organic)**
  - _Question:_ How does it actually happen?
  - \_High +Z (Directed):\* Proactive, app-driven, explicit rules, scheduled, aimed.
  - \_High -Z (Organic):\* Spontaneous, emergent, fluid vibes, authentic, growing.

**Scoring Math:**
Transform 1-5 scale to -2 to +2 for coordinate plotting.

- 1 = -2 (Strong pull to negative pole)
- 2 = -1
- 3 = 0
- 4 = +1
- 5 = +2 (Strong pull to positive pole)

## 3. Intake Logic & Routing (The 5th Axis: Time)

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
- **Shadow Tag:** Optional modifier for Bound Mode. "Did you secretly operate outside the agreements (cheating)?" Adds a visual fracture to the data point.

**Application Rules:**

- **T0 & T1:** User answers questions TWICE per era/present (Once for Scouting, Once for Bound).
- **T2 & T3:** User answers questions ONCE (Aspirational architecture is inherently Bound).

**Crucial Survey Prompting Logic:**
To ensure monogamous users can accurately answer the X and W axes in Bound mode, questions must be framed around **Orientation/Desire** rather than **Current Behavior**.

- _Scouting Prompt:_ "Answer based on how you operate and what you seek when single/unbound."
- _Bound Prompt:_ "Answer based on your ideal bond structure and boundaries, even if you are currently single."

## 5. Survey Flow & UI Logic

### Phase 1: Intake

Collect `chron_age` and `awake_age`. Calculate routing.

### Phase 2: T0 - The Storyline (Quick Vibe Check)

- **UI:** Allow users to create custom "Era" names (e.g., "The College Years", "First Marriage"). Max 4 eras.
- **Questions per Era:** 4 Quick Vibe questions (1 per axis).
- **Modes per Era:** Answered twice (Scouting + Bound).
- **Total questions per Era:** 8. (Very fast to prevent fatigue).

### Phase 3: T1 - Present (Deep Dive)

- **Questions:** 20 Core Engine questions (5 per axis).
- **Modes:** Answered twice (Scouting + Bound).
- **Total questions:** 40. (Presented in dual-slider format to reduce reading fatigue).

### Phase 4: T2 - Aspiration (Deep Dive)

- **Questions:** 20 Core Engine questions.
- **Modes:** Answered once (Bound only).
- **Total questions:** 20.

### Phase 5: T3 - Horizon (Deep Dive)

- **Questions:** 20 Core Engine questions.
- **Modes:** Answered once (Bound only).
- **Total questions:** 20.

## 6. Question Banks

### Quick Vibe Check (Used for T0 Eras)

- **W-Check:** I believe my core bond should strictly contain all intimacy (sexual and emotional) within its boundaries, rather than allowing outside connections to freely enter.
- **X-Check:** I want the freedom to pursue sexual variety and recreational play with others, rather than keeping all outside connections strictly focused on deep emotional romance.
- **Y-Check:** I envision my ideal life having a central "home base" partner or anchor, rather than keeping my living and financial life entirely my own.
- **Z-Check:** I prefer to find and manage connections through intentional design (apps, explicit boundaries, scheduled quests), rather than letting them erupt organically from permissive social circles.

### Deep Dive Core Engine (Used for T1, T2, T3)

_(All phrased so 5 = Strongest pull to Positive Pole. Phrased to capture Orientation/Desire so they work for both Scouting and Bound modes, including strict monogamy.)_

**W-Axis (Permeability: Exclusive +W vs Open -W)**

1. I believe my core bond should strictly contain all intimacy (sexual and emotional) within its boundaries, rather than allowing outside connections to freely enter.
2. I prefer a relationship architecture with a "steel wall" around the core unit, rather than a "screen door" that lets certain people or energies through.
3. I am most comfortable when outside interactions are highly restricted or forbidden by agreement, rather than having an open boundary policy.
4. I view the boundary of my relationship as a closed loop, rather than a horizon line that others can cross.
5. I believe true security comes from strict exclusivity (whether monogamous or a closed polycule), rather than from allowing permeable boundaries.

**X-Axis (Drive: Recreational +X vs Romantic -X)**

1. I want the freedom to pursue sexual variety and recreational play with others, rather than keeping all outside connections strictly focused on deep emotional romance.
2. I view sexual play with others primarily as a fun, recreational enhancement to life, rather than a path to building deeply intertwined emotional lives.
3. I am drawn to outside connections primarily for the physical/erotic thrill, rather than for the purpose of bringing them "into the light" as chosen family.
4. I believe outside relationships are best when they remain casual and sport-like, rather than evolving into deeply bonded, romantic integrations.
5. I imagine I would be more fulfilled by a wide variety of casual/playful sexual connections than by seeking multiple profound emotional romances.

**Y-Axis (Architecture: Interdependent +Y vs Autonomous -Y)**

1. I envision my ideal life having a central "home base" partner or anchor, rather than keeping my living and financial life entirely my own.
2. I believe it is natural and ethical for one relationship to hold clear priority in my life decisions over others.
3. I imagine wanting to deeply merge my logistics (finances, housing, family building) with a partner, rather than maintaining strict logistical independence.
4. I envision my ideal relationship architecture having a central, prioritized partnership, with other connections playing more peripheral roles.
5. I see the "couple/unit" as the fundamental unit of my relational life, rather than the "individual."

**Z-Axis (Method: Directed +Z vs Organic -Z)**

1. I prefer to find and manage connections through intentional design (apps, explicit boundaries, scheduled quests), rather than letting them erupt organically from permissive social circles.
2. I prefer to rely on explicitly negotiated rules and boundaries regarding outside interactions (even if the rule is strict exclusivity), rather than fluid, unspoken social vibes.
3. I believe relational structures work best as a scheduled, defined activity, rather than something that spontaneously happens when the vibe is right.
4. I prefer relationships to stay true to their original intent (e.g., a play partner stays a play partner; a closed bond stays closed), rather than letting them organically evolve far beyond their starting point.
5. I am someone who designs my relationship structure from a blueprint, rather than letting it grow like a garden based on who we meet and what the situation requires.

## 7. The 16 Archetypes (Hyper-Octants)

With 4 axes, there are 16 possible coordinate combinations. Here are the mapped archetypes:

#### 1. The Monogamous Anchor (+W, -X, +Y, +Z)

_Exclusive + Romantic + Interdependent + Directed_
You are strictly monogamous. You desire a deeply merged, prioritized anchor bond defined by profound emotional intimacy and strict, explicit boundaries. You leave nothing to chance, building your life from a careful blueprint with a "steel wall" around your unit.

#### 2. The Poly Architect (+W, -X, +Y, +Z) -> _Wait, W and X conflict here. Let's fix._

_(Correction: +W is Exclusive, -X is Romantic. So this is a Closed Poly/Triad)._
_Exclusive + Romantic + Interdependent + Directed_
You want a deeply merged, prioritized anchor bond, but you are open to extending that deep emotional intimacy to a specific, closed circle of others. You believe in explicit negotiation and closed-loop polyamory (like a planned triad). You leave nothing to chance.

#### 3. The Pragmatic Chosen Family (-W, -X, +Y, -Z)

_Open + Romantic + Interdependent + Organic_
You have an anchor, but your boundaries are open. You let relationships grow organically into an intertwined "chosen family." A play partner becomes a co-parent; a lover becomes a roommate. You let connections grow like a garden based on practical needs.

#### 4. The Tribal Erotic (-W, +X, +Y, -Z)

_Open + Recreational + Interdependent + Organic_
You have a deep "home base" anchor, but you thrive on sexual variety that erupts naturally from your permissive social ecosystem. You immerse yourself in a tribe where flirtation and group energy spontaneously combust. The organic flow of the room dictates the play.

#### 5. The Lifestyle Swingers (-W, +X, +Y, +Z)

_Open + Recreational + Interdependent + Directed_
You are fundamentally an interdependent unit who views outside sexual variety as a recreational team sport. You actively seek out erotic energy to augment your bond, preferring to design this play deliberately—using apps, seeking specific scenarios, or attending clubs together.

#### 6. The Controlled Burn / Cuckold (+W, +X, +Y, +Z)

_Exclusive + Recreational + Interdependent + Directed_
Your bond is strictly exclusive emotionally (+W), but you deliberately direct (+Z) highly erotic, recreational play (+X) that involves others. Because the outside connections are kept "in the dark" and not brought into the emotional core, the unit remains closed and prioritized.

#### 7. The Monogamish Unit (+W, +X, +Y, +Z)

_(Note: This is a mid-W, but leaning exclusive. Let's use the mid-points for some)._
_Permeable + Recreational + Interdependent + Directed_
You have a merged, prioritized core bond, but with a "screen door" boundary. You allow specific, directed, recreational erotic play (hall passes, vacation rules), but you keep strict exclusivity on romance and emotional integration.

#### 8. The Solo Player (-W, +X, -Y, +Z)

_Open + Recreational + Autonomous + Directed_
You are your own primary. You have no desire to merge your life, but you have a high drive for sexual variety. You are highly directed about how you get your needs met—using apps, going to specific events, or setting up clear, casual arrangements.

#### 9. The Free Agent (-W, +X, -Y, -Z)

_Open + Recreational + Autonomous + Organic_
You are fiercely independent and drawn to sexual play, but refuse to schedule it. You thrive in permissive social circles where casual, spontaneous connections erupt when the vibe is right. You flow through social spaces without logistical strings.

#### 10. The Solo Polyamorist (-W, -X, -Y, +Z)

_Open + Romantic + Autonomous + Directed_
You crave deep romantic intimacy, but refuse to merge your life logistics. You build connections deliberately, negotiating boundaries clearly so everyone gets deep emotional support without entangling finances or primary status. You are the CEO of your life.

#### 11. The Relationship Anarchist (-W, -X, -Y, -Z)

_Open + Romantic + Autonomous + Organic_
You reject all blueprints. You do not rank connections, merge logistics, or follow scripts. You let every connection grow organically into whatever it is meant to be. Your network is a fluid, unstructured web of profound care and mutual aid.

#### 12. The Guarded Free Agent (+W, +X, -Y, -Z)

_Exclusive + Recreational + Autonomous + Organic_
You are independent, but you keep your casual, spontaneous sexual encounters at a strict distance. You enjoy the organic thrill of the moment, but you do not let outside connections permeate your life or become romantic.

#### 13. The Lone Wolf Romantic (+W, -X, -Y, -Z)

_Exclusive + Romantic + Autonomous + Organic_
You seek deep, romantic, one-on-one connections that evolve organically, but you refuse to merge your life logistics. When you bond, it is intense and exclusive, but your autonomy remains paramount.

#### 14. The Serial Monogamist (+W, -X, -Y, +Z)

_Exclusive + Romantic + Autonomous + Directed_
You are independent, but you intentionally seek out strict, exclusive, romantic relationships one at a time. You use apps and deliberate dating to find "the one," merge temporarily, but maintain your own life architecture.

#### 15. The Closed Nest (+W, -X, +Y, -Z)

_Exclusive + Romantic + Interdependent + Organic_
You want a deeply merged, emotionally profound anchor bond that just naturally evolved into a closed, exclusive unit. You didn't plan it from a blueprint; it just grew into a secure, walled garden for two (or a closed group).

#### 16. The Open Polycule (-W, -X, +Y, +Z)

_Open + Romantic + Interdependent + Directed_
You are building a deliberate, open polycule. You have an anchor, but you intentionally seek out and design deep romantic integrations with others, bringing them "into the light" to build a structured, multi-partner chosen family.

## 8. Data Visualization Spec (The Output)

Render an interactive **Radar/Constellation Map** (using D3.js, Chart.js, or similar). A 3D cube is no longer used due to the 4 spatial axes.

**The Map:**

- 4 axes radiating from a center point (W, X, Y, Z).
- The user's scores plot a polygon shape.
- The shape's size indicates intensity of orientation; its skew indicates which poles it leans toward.

**Data Points (Over Time):**

- **T0 (Eras):** Small, faint polygons.
- **T1 (Present):** Large, solid polygons (One for Scouting, One for Bound).
- **T2 (Aspiration):** Bright target polygon.
- **T3 (Horizon):** Glowing/final polygon.

**Modifiers:**

- **Color/Border:** Scouting Mode (e.g., Blue) vs. Bound Mode (e.g., Orange).
- **Fracture/Jagged Edge:** Bound Mode + Shadow Tag (Cheating/Agreement breaking).

**Vectors (Trajectories):**

- Connect the centroids of the polygons chronologically (T0 -> T1 -> T2 -> T3).
- **Friction Gap:** Highlight the distance between T1 (Present) and T2 (Aspiration). A large distance = high dissatisfaction/desire for change.

**Diagnostic Readout (Text):**
Generate a text summary based on coordinates. E.g., "You are currently The Lifestyle Swingers, but your Aspiration vector points toward The Pragmatic Chosen Family. You are seeking more organic, romantic integration over directed recreational play."
