# Trinity Grade 7 Scales App — Technical Specification v3

## 1. Purpose

Build a lightweight, single-user, offline-first PWA for practising the Trinity Grade 7 Piano scales and arpeggios.

The product should feel like a small, polished phone app rather than a conventional website. It must work without an account, backend, cloud database, telemetry, or network connection after the application has been loaded/installed.

This application is intentionally lightweight. It is based on the successful architecture of the existing Grade 6 practice app: plain HTML, CSS, JavaScript, local persistence, a web manifest, and a service worker. Grade 7 should improve the syllabus model, practice-selection logic, history, analytics, accessibility, wording, and visual polish without introducing framework or infrastructure complexity that is not required by the product.

## 2. Core product loop

The default screen is a continuous practice deck:

1. The app selects the next practice card.
2. The instruction is displayed clearly.
3. The instruction is spoken using browser text-to-speech.
4. The student plays the requested scale/arpeggio on the piano.
5. The student self-scores from 1 to 10 using two rows of five large buttons.
6. The score is saved locally.
7. The next card is selected immediately and spoken.
8. Repeat indefinitely until the student leaves the practice screen.

There is no login, session setup, timer, “Next” button after scoring, confirmation screen, or requirement for the student to speak to the app.

The app is intended for short practice periods, typically around 10 minutes. The scheduler should therefore behave like a responsive practice coach rather than a formal long-term flashcard system.

## 3. Product principles

### 3.1 Keep it small

Prefer the simplest implementation that satisfies the requirement.

The preferred implementation is:

- HTML
- CSS
- modern browser JavaScript
- `localStorage`
- Web Speech API
- Web App Manifest
- Service Worker / Cache API

Do not introduce React, TypeScript, Vite, IndexedDB/Dexie, backend services, build pipelines, component libraries, cloud APIs, authentication, telemetry, or other dependencies unless a concrete requirement demonstrates that they are necessary.

### 3.2 Local first

All practice data, scheduler state, and analytics must remain on the device.

No network request should be required during practice.

### 3.3 Product data is separate from code behaviour

The musical syllabus must be represented as structured data in one clearly identifiable file/section, rather than scattered through UI code.

The scheduler, analytics, and UI must operate on that structured data.

### 3.4 Do not invent musical requirements

The supplied Grade 7 syllabus specification and source image are the source of truth for musical content. Do not infer fingering, notes, rhythmic details, or exam requirements that are not explicitly present in the source.

### 3.5 Simple behaviour is preferable to cleverness

The scheduler should be understandable by a developer reading it for the first time.

Its central rule is simple:

> Cards the student plays poorly should appear more frequently. Cards the student plays well should still appear occasionally.

The algorithm should use this principle directly rather than attempting to reproduce Anki, SM-2, or another elaborate spaced-repetition system.

## 4. Technology and project structure

Use a minimal static application. A reasonable starting structure is:

```text
trinity-7/
  index.html
  styles.css
  app.js
  syllabus.js
  scheduler.js
  storage.js
  speech.js
  manifest.json
  sw.js
  icons/
    icon-192.png
    icon-512.png
  tests/
  README.md
```

A small number of additional JavaScript files is acceptable if they genuinely improve clarity, but do not create an elaborate application architecture.

Recommended responsibilities:

- `index.html` — application shell and semantic markup
- `styles.css` — all styling and responsive behaviour
- `app.js` — application state, UI events, practice flow, analytics rendering
- `syllabus.js` — declarative Grade 7 syllabus and card generation
- `scheduler.js` — pure scheduling logic, retry queue, weighted selection, and scheduler configuration
- `storage.js` — versioned localStorage state and persistence helpers
- `speech.js` — speech wording and voice selection
- `manifest.json` — installable PWA metadata
- `sw.js` — offline caching

Keep business logic in small, testable functions. Avoid a framework merely to enforce structure.

## 5. Syllabus and card model

The fundamental practice unit is a **card**:

> musical item + articulation + dynamic

Therefore these are separate cards:

- E major scale + legato + forte
- E major scale + staccato + mezzo-forte

Each card has its own independent practice history and scheduling state.

### 5.1 Syllabus source model

Represent each underlying musical item with fields broadly equivalent to:

```js
{
  id: 'e-major-scale',
  category: 'scale',
  name: 'E major scale',
  spokenName: 'E major scale',
  form: 'standard',
  octaves: 4,
  hands: 'together',
  motion: 'similar',
  tempo: 130,
  allowedDynamics: ['f', 'mf', 'p', 'crescendo-diminuendo'],
  allowedArticulations: ['legato', 'staccato']
}
```

Special items should define their restrictions explicitly.

Example shape:

```js
{
  id: 'e-major-thirds',
  category: 'scale',
  name: 'E major scale in thirds',
  octaves: 2,
  hands: 'separately',
  allowedDynamics: ['mf'],
  allowedArticulations: ['legato']
}
```

Do not assume the exact spelling of every field must match these examples; clarity and consistency matter more than literal field names.

### 5.2 Card generation

Generate cards from the syllabus definition rather than hand-writing 122 independent objects.

For each syllabus item:

- create the Cartesian product of allowed dynamics and articulations
- where a condition is fixed, its allowed array contains one value
- where there is no dynamic requirement, represent dynamic as `null`
- assign each card a deterministic stable ID derived from the underlying item and conditions

Examples:

```text
scale:e-major:legato:f
scale:e-major:legato:mf
scale:e-major:staccato:f
scale:e-major:staccato:mf
...
arpeggio:e-major-contrary:legato:none
```

The exact ID format is an implementation detail, but IDs must be stable between application versions unless a deliberate migration is made.

### 5.3 Card-count invariant

The implementation must validate the expected total of **122 cards** from the supplied Grade 7 syllabus specification.

Tests/validation should fail loudly if the generated count is not 122.

The verified breakdown is:

- 7 variable standard scale items × 8 combinations = 56 cards
- 1 special E major in thirds item = 1 card
- 8 variable standard arpeggio items × 8 combinations = 64 cards
- 1 special E major contrary-motion arpeggio item = 1 card
- total = 122 cards

This breakdown has been checked against the supplied Grade 7 source image and should be treated as authoritative for v1.

## 6. Practice screen

The practice screen should be visually calm, sparse, and phone-first.

Suggested layout:

- small navigation/header area
- large central musical instruction
- clear articulation/dynamic line
- secondary technical information such as octaves/hands/tempo where useful
- voice status only when there is a problem
- score prompt
- ten large score buttons in two rows of five

Example display:

```text
E major scale
mf · staccato

4 octaves · hands together

How did you play it?

┌───┬───┬───┬───┬───┐
│ 1 │ 2 │ 3 │ 4 │ 5 │
├───┼───┼───┼───┼───┤
│ 6 │ 7 │ 8 │ 9 │10 │
└───┴───┴───┴───┴───┘
```

The UI should have comfortable touch targets and should work well on a small phone in portrait orientation.

### 6.1 Initial launch

The app should be ready to present a card without unnecessary setup.

On first use, create a shuffled first-pass queue containing all 122 cards.

The initial queue exists to ensure every card is introduced once before normal scheduling begins.

### 6.2 Score interaction

When a score button is tapped:

1. immediately prevent accidental double submission
2. append the score to the card's history
3. update that card's scheduler state
4. persist the data
5. select the next card
6. display and speak the next card immediately

There should be no intermediate “Saved”, “Correct”, “Next”, or confirmation state.

## 7. Local persistence

Use browser-native `localStorage`.

The stored structure should contain at least:

```js
{
  version: 1,
  attempts: {
    [cardId]: [
      { score: 8, timestamp: 1760000000000 },
      { score: 9, timestamp: 1760500000000 }
    ]
  },
  states: {
    [cardId]: {
      introducedAt: 1760000000000,
      lastReviewedAt: 1760500000000,
      lastScore: 9
    }
  },
  introductionQueue: [],
  introductionPosition: 0,
  retryQueue: [],
  activePromptCardId: null,
  lastCardId: null,
  settings: {
    speechEnabled: true
  }
}
```

Exact names are not mandatory. The important requirements are:

- retain the complete score history
- retain timestamps
- retain the most recent score
- retain the initial queue
- retain urgent retry state
- persist the currently active prompt so a browser/app restart does not silently lose it
- keep the schema versioned for future migration

### 7.1 Do not discard history

Unlike the Grade 6 prototype, Grade 7 must retain all historical score records.

There is no five-score rolling limit.

This is important for analytics and for improving the scheduler over time.

### 7.2 Reset

Provide a discreet reset function in settings/analytics.

Reset must:

- require explicit confirmation
- delete practice history
- delete scheduler state
- reset the initial introduction queue
- clear retry state
- retain the bundled syllabus

## 8. Adaptive practice scheduler

The scheduler is intentionally simpler than a formal spaced-repetition system.

The goal is to make short practice sessions effective by preferentially selecting cards that need work while continuing to rotate stronger cards through the deck.

There are four rules:

1. **Very poor result → retry soon.**
2. **Lower historical performance → higher normal selection weight.**
3. **Longer since last practice → higher selection weight.**
4. **Every introduced card retains a non-zero chance of normal selection.**

The scheduler must not depend on a fixed long-term interval table.

### 8.1 Immediate retry rule

A score of **1, 2, or 3** is treated as an urgent retry.

After such a score:

- place that card into an urgent retry queue
- schedule it to become eligible again within the next **2–4 scored cards**
- do not normally show it immediately on the very next card
- if several cards are awaiting urgent retry, choose among the eligible retry cards with a small amount of randomness
- once retried, remove the card from the urgent retry queue

The purpose is to let the student attempt a poorly played item again while the mistake is still fresh.

The exact implementation may use a target turn number, eligible-after count, or another simple mechanism. It must preserve the observable behaviour above.

If an urgent retry is eligible but the immediately previous card is the same card, use another valid candidate first.

### 8.2 Effective score

For normal selection, the primary measure of a card's weakness is its historical score.

Use the complete score history to calculate the arithmetic average.

To give a recent change in performance a modest influence, calculate:

```text
effectiveScore =
    0.80 × historicalAverage
  + 0.20 × mostRecentScore
```

For a card with only one score, the effective score is simply that score.

Do not create separate “easy / medium / hard” categories for the algorithm.

### 8.3 Weakness

Calculate:

```text
weakness = 11 - effectiveScore
```

Therefore, lower scores produce larger weakness values.

Examples:

```text
Effective score 3  → weakness 8
Effective score 6  → weakness 5
Effective score 9  → weakness 2
Effective score 10 → weakness 1
```

The weakness value must remain positive so that even strong cards continue to have a non-zero base selection weight.

### 8.4 Recency

Cards should receive more attention as time passes since their last review.

Use a deliberately simple recency factor, for example:

```text
recencyFactor = min(hoursSinceLastReview / 24, 1)
```

This means:

- immediately after practice: approximately 0
- after 12 hours: approximately 0.5
- after 24 hours or more: 1

The recency effect should not grow without limit. Its purpose is to bring neglected strong cards back into rotation, not to overwhelm weak cards.

### 8.5 Normal selection weight

For introduced cards that are not currently awaiting urgent retry, calculate:

```text
weight = weakness + (2 × recencyFactor)
```

This is intentionally simple.

Consequences:

- weaker cards have substantially greater weight
- the same card becomes somewhat more attractive as it gets older
- strong cards never have zero weight
- a strong card that has not been played for a while can return naturally

All scheduler constants should live together in `scheduler.js` so that they can be tuned after real-world use.

### 8.6 Immediate-repeat prevention

The scheduler should not select the immediately previous card when another valid candidate exists.

The urgent retry mechanism is an exception to the normal scheduling rules, but even urgent retries should normally have other cards between the original failure and the retry.

### 8.7 Weighted random selection

Normal selection must use weighted random selection rather than always selecting the highest-weight card.

Use an injected RNG so tests can be deterministic.

This randomness is deliberate: two practice sessions should not necessarily follow the same sequence even when the underlying performance data is identical.

### 8.8 Selection order

When selecting the next card after a score:

1. If the score was 1–3, add that card to the urgent retry queue with an eligibility point 2–4 cards in the future.
2. Determine whether any urgent retry cards are currently eligible.
3. If eligible urgent retry cards exist and a valid alternative is available, select from the urgent retry cards with a small amount of randomness. Do not immediately repeat the previous card.
4. Otherwise, select from the normal pool using weighted random selection.
5. Exclude the immediately previous card from the normal pool when another card exists.
6. Use the weight described above for each normal candidate.

This means urgent failures are handled first, while ordinary practice remains driven primarily by average performance.

### 8.9 First-pass introduction

Before normal scheduling begins:

1. create a shuffled queue containing all 122 card IDs
2. persist the queue
3. present cards from that queue one by one
4. record `introducedAt` when the card is presented
5. persist the active card before rendering it
6. after the student scores it, advance the queue
7. if the score is 1–3, the card may enter the urgent retry queue even during the initial pass
8. after every card has been introduced once, normal scheduling controls future selection

If the application closes while a card is awaiting a score, reopen that same card rather than silently skipping it.

### 8.10 New cards

A card is considered “new” until it has been presented once.

New cards are controlled by the initial 122-card introduction queue rather than the normal weighted scheduler.

This guarantees complete first-pass coverage of the syllabus.

## 9. Speech

Use the browser Web Speech API (`speechSynthesis`).

Keep this behind a small function/module so it can be adjusted later without changing scheduling or UI logic.

### 9.1 Preferred voice

The preference is:

1. installed local `en-GB` English voice
2. where available, a female-sounding British voice
3. otherwise another local English voice
4. otherwise the browser default

The application must not depend on a remote speech service.

Do not claim that a specific gender is guaranteed by the browser API.

### 9.2 Spoken wording

Generate speech text intentionally from the card rather than reading arbitrary UI text.

Examples:

> “E major scale. Staccato. Mezzo-forte.”

> “Chromatic scale, left hand starting on C, right hand starting on E-flat. Legato. Forte.”

> “E major scale in thirds. Legato. Mezzo-forte.”

For crescendo/diminuendo, use natural wording such as:

> “Crescendo and diminuendo, piano to forte to piano.”

Speech should be calm and slightly slower than default conversational speed; start around `0.9` and tune on the target phone.

Speech failure must never prevent the visual practice flow.

## 10. Analytics

Analytics are derived entirely from locally stored attempt history joined to the card/syllabus definitions.

The analytics screen should be useful but not dashboard-heavy.

At minimum show:

### Overall

- total attempts
- overall average
- cards introduced / 122
- cards attempted / 122

### Individual musical items

List the underlying scale/arpeggio items from lowest average score to highest average score.

For each item show:

- average score
- attempt count

Where no score exists, show “—” rather than 0.

### Exact cards

Provide a way to inspect the individual card combinations, including dynamic and articulation, with average score and attempt count.

### Articulation

- Legato average
- Staccato average

Only include attempts that actually have that articulation condition.

### Dynamics

- Forte average
- Mezzo-forte average
- Piano average
- Crescendo/diminuendo average

Only include attempts that actually have that dynamic condition.

### Avoid unnecessary gamification

Do not add streaks, badges, XP, levels, leaderboards, motivational pop-ups, or “mastery” labels in v1.

## 11. PWA and offline requirements

The app must be installable to a phone and should feel native when launched from the home screen.

### Manifest

Include:

- application name
- short name
- standalone or fullscreen display
- appropriate theme/background metadata
- installable icons
- start URL

### Service worker

Cache the complete application shell and all local assets needed to operate the app.

The runtime app must not depend on a CDN, remote font, remote icon, analytics endpoint, API call, or external JavaScript library.

After the first successful load/install, the following must work with the device offline:

- opening the app
- generating cards
- selecting cards
- speech where the operating system/browser provides a local voice
- recording scores
- viewing analytics
- resetting data

The service worker should use a simple cache strategy appropriate to static assets. Keep update logic understandable and avoid complicated offline-sync machinery.

## 12. Visual design

The app should improve substantially on the Grade 6 prototype while remaining lightweight.

Goals:

- beautiful but restrained
- uncluttered
- excellent typography
- excellent touch targets
- strong contrast and accessibility
- pleasant portrait use on a phone
- no “website dashboard” appearance
- no visual noise between exercises

Use CSS rather than a component framework.

Design should support both a small phone and a desktop browser used during development.

## 13. Accessibility

At minimum:

- semantic buttons for score controls
- visible focus states
- keyboard access on desktop
- sufficient colour contrast
- no essential information conveyed by colour alone
- responsive text that remains readable on small screens
- accessible labels for navigation and controls

## 14. Testing

Do not create a large automated testing infrastructure merely for its own sake.

Focus testing effort on the parts where an error would materially affect the product.

### High-value tests

1. **Syllabus/card generation**
   - exactly 122 cards
   - stable unique IDs
   - correct special cases
   - no accidental extra dynamic/articulation combinations

2. **Scheduler**
   - effective score calculation
   - weakness calculation
   - recency factor
   - normal selection weight
   - score 1–3 urgent retry behaviour
   - retry delay of 2–4 subsequent cards
   - immediate-repeat prevention
   - introduction queue
   - weighted random selection
   - strong-card return through recency
   - non-zero selection weight for strong cards
   - scheduler never gets stuck

3. **Persistence**
   - scores survive reload
   - full history is retained
   - active prompt survives reload
   - introduction queue survives reload
   - retry state survives reload
   - reset works
   - malformed/missing stored data does not crash the application

4. **Practice flow**
   - score tap records a score
   - next card appears immediately
   - double taps do not create duplicate scores
   - speech failure does not break scoring

5. **PWA/offline**
   - service worker installs
   - production assets are cached
   - application can reload while offline after initial load

### Scheduler simulation tests

Run seeded simulations of approximately 10,000 selections.

At minimum, test scenarios such as:

A. **Mostly strong deck with a weak minority**

Five cards average around 3 while the remaining cards average around 8. Verify that the weak cards are selected substantially more often.

B. **Strong cards still rotate**

Five cards average around 9.5. Verify that they still appear periodically rather than disappearing entirely.

C. **New poor result**

A card with a historical average around 8 receives a new score of 2. Verify that it becomes eligible for an urgent retry within 2–4 subsequent cards.

D. **Recency return**

A strong card has not been reviewed for a substantial period. Verify that its recency factor increases its normal selection weight and allows it to return.

E. **Variety**

Verify that repeated simulations do not produce one fixed deterministic order when different random seeds are used.

Do not require one exact selection percentage. The purpose of simulation is to verify sensible qualitative behaviour.

The simulation should make it easy to adjust scheduler constants later and rerun the experiment.

## 15. Development phases

Implement incrementally and get approval between major phases.

### Phase 1 — Foundation and syllabus

Completed before this specification version:

- create the minimal static project
- add syllabus data
- generate 122 cards
- validate card counts and stable IDs
- add focused tests

### Phase 2 — Scheduling engine

- implement the simplified adaptive scheduler in `scheduler.js`
- implement the 1–3 urgent retry mechanism
- implement effective score, weakness and recency calculations
- implement weighted random selection
- implement immediate-repeat prevention
- implement the normal scheduling API
- implement deterministic RNG injection for tests
- add scheduler unit tests
- add seeded simulation tests

### Phase 3 — Local persistence

- persist history/state in localStorage
- persist introduction queue
- persist active prompt
- persist retry queue/state
- implement reset
- ensure safe handling of corrupt/missing data

### Phase 4 — Practice UI

- build mobile-first practice screen
- implement 1–10 score controls
- implement immediate score-to-next-card flow
- implement accessible navigation

### Phase 5 — Speech

- add Web Speech API adapter
- implement voice preference logic
- implement speech wording
- add graceful failure behaviour

### Phase 6 — Analytics

- overall metrics
- weakest-to-strongest item list
- exact card performance
- articulation averages
- dynamic averages

### Phase 7 — PWA/offline

- manifest
- icons
- service worker
- install behaviour
- offline testing

### Phase 8 — Polish and device testing

- visual refinement
- accessibility pass
- target-phone testing
- tune speech speed/voice preference
- tune scheduler constants if real use reveals obvious issues

## 16. Scope boundaries for v1

Explicitly out of scope:

- accounts
- authentication
- cloud storage
- synchronisation across devices
- backend/server
- multiplayer
- social features
- web analytics/telemetry
- remote TTS APIs
- music playback/accompaniment
- microphone/audio recording
- automatic assessment of the student's piano playing
- calendar/session scheduling
- gamification

## 17. Backup/export consideration

Because data is local-only, users can lose their history by clearing browser storage or changing devices.

For v1, design the storage structure so it can be serialized and restored later without redesigning the core data model.

A simple JSON export/import option may be included if it can be implemented without adding meaningful complexity. It should not delay the core practice experience.

## 18. Decisions already made

The following are product decisions, not open questions:

- The fundamental card is **musical item + articulation + dynamic**.
- Different articulation/dynamic combinations of the same musical item are separate cards.
- The first-use experience introduces every one of the 122 cards exactly once.
- After the first pass, the scheduler should favour lower-scoring cards.
- A score of 1–3 triggers an urgent retry within the next 2–4 cards.
- Strong cards must continue to rotate rather than disappear permanently.
- The student does not configure sessions, timers, or review intervals.
- The student simply scores each performance 1–10 and immediately receives the next request.
- Full score history is retained.
- The app is single-user and local-only.
- The preferred voice is a local British English female-sounding voice where the device provides one, with graceful fallback.
- No backend, account, authentication, cloud sync, or external service is required for normal use.
- The architecture should remain lightweight enough to be comfortable on a phone and understandable to a developer without a large framework stack.

## 19. Definition of done for the product

The v1 product is complete when:

- exactly 122 valid practice cards are generated from the syllabus data
- the first-use queue introduces all 122 cards
- the student can continuously practice by listening, playing, scoring, and immediately receiving the next request
- scores 1–3 result in a rapid retry of the failed card
- lower-performing cards are selected more frequently than stronger cards during normal practice
- stronger cards continue to appear through normal rotation
- all score history is retained locally
- analytics correctly reflect the stored history
- speech works where supported and never blocks visual practice
- the app installs as a PWA and operates offline after first load/install
- no account, server, network API, or external runtime dependency is required
- the interface is comfortable and attractive on a phone
- the scheduler tests and simulations demonstrate the intended behaviour
