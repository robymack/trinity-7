# Trinity Grade 7 Scales App — Technical Specification v2

## 1. Purpose

Build a lightweight, single-user, offline-first PWA for practising the Trinity Grade 7 Piano scales and arpeggios.

The product should feel like a small, polished phone app rather than a conventional website. It must work without an account, backend, cloud database, telemetry, or network connection after the application has been loaded/installed.

This application is intentionally lightweight. The project is based on the successful architecture of an existing Grade 6 practice app using plain HTML, CSS, JavaScript, local persistence, a web manifest, and a service worker. Grade 7 should improve the scheduling algorithm, persistence/history, analytics, accessibility, wording, and visual polish without introducing framework or infrastructure complexity that is not required by the product.

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

## 3. Product principles

### 3.1 Keep it small

Prefer the simplest implementation that satisfies the requirement.

Do not introduce React, TypeScript, Vite, IndexedDB/Dexie, backend services, build pipelines, component libraries, cloud APIs, analytics services, authentication, or other dependencies unless a concrete requirement demonstrates that they are necessary.

The preferred implementation is:

- HTML
- CSS
- modern browser JavaScript
- localStorage (or another browser-native local mechanism only if a concrete limitation is demonstrated)
- Web Speech API
- Web App Manifest
- Service Worker / Cache API

### 3.2 Local first

All practice data, scheduler state, and analytics must remain on the device.

No network request should be required during practice.

### 3.3 Product data is separate from code behaviour

The musical syllabus must be represented as structured data in one clearly identifiable section/file, rather than scattered through UI code.

The scheduler, analytics, and UI must operate on that structured data.

### 3.4 Do not invent musical requirements

The supplied Grade 7 syllabus specification/source image is the source of truth for musical content. Do not infer fingering, notes, rhythmic details, or exam requirements that are not explicitly present in the source.

## 4. Technology and project structure

Use a minimal static application. A reasonable starting structure is:

```text
trinity-7/
  index.html
  styles.css
  app.js
  syllabus.js
  manifest.json
  sw.js
  icon.png
  README.md
```

A small number of additional JavaScript files is acceptable if it genuinely improves clarity, but do not create an elaborate application architecture.

Recommended responsibilities:

- `index.html` — application shell and semantic markup
- `styles.css` — all styling and responsive behaviour
- `app.js` — application state, UI events, practice flow, analytics rendering
- `syllabus.js` — declarative Grade 7 syllabus and card generation
- `manifest.json` — installable PWA metadata
- `sw.js` — offline caching

Keep business logic in small, testable functions within the JavaScript files. Avoid a framework merely to enforce structure.

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

Do not assume the exact spelling of every field must match these examples; clarity and consistency matter more than the literal names.

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

The specification currently describes:

- 7 variable standard scale items × 8 combinations = 56 cards
- 1 special E major in thirds item = 1 card
- 8 variable standard arpeggio items × 8 combinations = 64 cards
- 1 special E major contrary-motion arpeggio item = 1 card
- total = 122 cards

Before final release, verify the transcription against the supplied Grade 7 source image. The explicit 122-card breakdown should control implementation where wording in earlier descriptions is ambiguous.

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

On first use, a shuffled first-pass queue should be created containing all 122 cards.

The initial queue exists to ensure every card is introduced once before normal scheduling dominates selection.

### 6.2 Score interaction

When a score button is tapped:

1. immediately prevent accidental double submission
2. append the score to the card's history
3. update that card's scheduling state
4. persist the data
5. select the next card
6. display and speak the next card immediately

There should be no intermediate “Saved”, “Correct”, “Next”, or confirmation state.

## 7. Local persistence

Use browser-native `localStorage` unless testing identifies a specific requirement that it cannot satisfy.

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
      nextDueAt: 1760780000000,
      intervalMs: 2419200000
    }
  },
  introductionQueue: [],
  introductionPosition: 0,
  activePromptCardId: null,
  lastCardId: null,
  settings: {
    speechEnabled: true
  }
}
```

Exact names are not mandatory; the important requirements are:

- retain the complete score history
- retain timestamps
- retain scheduling state
- retain the initial queue
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
- retain the bundled syllabus

## 8. Spaced repetition and next-card algorithm

The purpose of the scheduler is not to reproduce Anki. It is to make the student's limited practice time disproportionately target cards that need work while still maintaining spaced retrieval of strong cards and reasonable coverage of the whole syllabus.

The algorithm should be understandable, deterministic when given a supplied random generator, and easy to tune from a single configuration section.

### 8.1 Review interval mapping

Use the self-score to determine an initial review interval:

| Score | Initial interval |
|---|---:|
| 1 | 10 minutes |
| 2 | 20 minutes |
| 3 | 45 minutes |
| 4 | 2 hours |
| 5 | 8 hours |
| 6 | 1 day |
| 7 | 2 days |
| 8 | 4 days |
| 9 | 7 days |
| 10 | 14 days |

For later reviews:

- scores 1–5 reset to the corresponding initial interval
- scores 6–10 extend the existing interval using a score-dependent multiplier
- maximum interval is 30 days

Suggested starting multipliers:

```text
6  → 1.3×
7  → 1.7×
8  → 2.2×
9  → 3.0×
10 → 4.0×
```

These are tuning values, not sacred constants. Keep them in one configuration object so they can be adjusted without rewriting scheduler logic.

### 8.2 Why the scheduler should not simply choose the lowest average

The application should favour weak cards, but raw average alone is insufficient.

A card with one score of 4 should not necessarily outrank a card with twenty scores averaging 6.0 merely because its sample size is tiny.

The scheduler therefore considers:

- average score / weakness
- number of attempts / confidence
- whether the card is due or overdue
- time since last review
- a coverage/rotation mechanism
- a small amount of randomness

### 8.3 Candidate priority

For an introduced card, calculate:

```text
weakness = (10 - averageScore) / 9

uncertainty = 1 / sqrt(max(1, attemptCount))

overdue =
  if nextDueAt <= now:
    clamp((now - nextDueAt) / max(intervalMs, 1), 0, 1)
  else:
    0

recency = clamp((now - lastReviewedAt) / 30 days, 0, 1)
```

For a card with no score history, it belongs to the introduction queue instead of the normal priority calculation.

### 8.4 Normal priority score

A recommended starting score is:

```text
priority =
    0.55 × weakness
  + 0.20 × overdue
  + 0.15 × uncertainty
  + 0.05 × recency
  + 0.05 × randomJitter
```

where `randomJitter` is a random value in `[0, 1)` supplied by an injectable RNG.

The exact weights should be kept in configuration.

### 8.5 Due-card selection

A card is due when `nextDueAt <= now`.

When one or more cards are due:

- exclude the immediately previous card where another valid candidate exists
- rank due cards by priority
- form a candidate set consisting of approximately the strongest 35% of due cards, with a minimum of 8 cards where available
- choose randomly from that candidate set using weighted selection rather than always selecting the single highest-priority card

This means the weakest material is strongly favoured without making the sequence perfectly predictable.

### 8.6 Rotation / coverage selection

Weak cards should not permanently starve stronger cards.

Therefore, in addition to the due-card path, the scheduler must sometimes deliberately select from a broader rotation pool.

Starting recommendation:

- approximately 85% of normal selections use the due-card path when due cards exist
- approximately 15% use the rotation/coverage path

The rotation path should favour:

- cards not seen recently
- cards with fewer attempts
- cards with weaker averages

but must give every introduced card a non-zero chance of being selected.

When there are no due cards, the scheduler should select from the broader rotation pool.

### 8.7 New-card introduction

Before normal scheduling begins:

1. create a shuffled queue containing all 122 card IDs
2. persist the queue
3. present cards from that queue one by one
4. record `introducedAt` when the card is presented
5. persist the active card before rendering it
6. once the student scores it, advance the queue
7. after all 122 cards have been introduced, begin normal scheduling

If the application closes while a card is awaiting a score, reopen that same card rather than silently skipping it.

### 8.8 Self-score history and statistics

For each card:

- arithmetic average
- number of attempts
- last score
- last reviewed timestamp
- current interval
- next due timestamp

Keep all of these derivable from local data.

Cached summary fields are optional, but the historical attempts remain the source of truth.

### 8.9 Scheduler testing

The scheduler must be tested with deterministic RNG input.

Include tests for:

- score-to-interval mapping
- interval extension
- 30-day cap
- weak cards receiving higher priority than otherwise-equivalent strong cards
- overdue cards gaining priority
- low-attempt cards receiving an uncertainty boost
- immediate repeat avoidance
- initial queue persistence
- strong cards eventually reappearing through rotation
- no card becoming permanently impossible to select

Also include a seeded simulation of many selections (for example 10,000) demonstrating that weak cards are selected substantially more often than strong cards under otherwise similar conditions, while strong cards still appear.

## 9. Speech

Use the browser Web Speech API (`speechSynthesis`).

Keep this behind a small function so it can be adjusted later without changing scheduling/UI code.

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
   - interval mapping
   - priority calculation
   - due/overdue behaviour
   - randomisation behaviour with deterministic RNG
   - introduction queue
   - repeat avoidance

3. **Persistence**
   - scores survive reload
   - full history is retained
   - active prompt survives reload
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

Testing may be implemented with lightweight browser/JS tests appropriate to the chosen static architecture. Do not introduce multiple testing frameworks unless there is a clear benefit.

## 15. Development phases

Implement incrementally and get approval between major phases.

### Phase 1 — Foundation and syllabus

- create the minimal static project
- add syllabus data
- generate 122 cards
- validate card counts and stable IDs
- add focused tests

### Phase 2 — Scheduling engine

- implement score history model
- implement review interval policy
- implement priority calculation
- implement due-card selection
- implement rotation/coverage selection
- implement deterministic RNG injection for tests
- test the scheduler thoroughly

### Phase 3 — Local persistence

- persist history/state in localStorage
- persist introduction queue
- persist active prompt
- implement reset
- ensure safe handling of corrupt/missing data

### Phase 4 — Practice UI

- build mobile-first practice screen
- implement 1–10 score controls
- implement immediate score-to-next-card flow
- add accessible navigation

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

For v1, implement the data layer so it can be serialized and restored later without redesigning the core data model.

A simple JSON export/import option may be included if it can be implemented without adding meaningful complexity. It should not delay the core practice experience.

## 18. Definition of done

The application is ready for v1 when:

- the Grade 7 syllabus is represented as structured data
- exactly 122 valid cards are generated
- every valid scale/arpeggio + articulation + dynamic combination is independently tracked
- the student can practise continuously with no unnecessary intermediate steps
- scores 1–10 are stored locally with complete history and timestamps
- the scheduler strongly favours weak/overdue material but retains meaningful rotation of stronger material
- the scheduler is tested and does not simply repeat the same weakest cards forever
- analytics accurately reflect the saved history
- the app works without a backend
- the app can be installed as a PWA
- the app functions offline after initial load
- speech is a convenience, not a single point of failure
- the app feels lightweight and polished on a phone
- no unnecessary framework or infrastructure has been introduced

## 19. Codex working rules

For this project, Codex should work in small, reviewable steps.

Do not interpret this document as permission to implement the entire application in one pass.

Before each major phase:

1. state what you intend to change
2. identify any assumptions
3. implement only the approved phase
4. run the relevant tests
5. report what changed
6. stop and wait for approval before beginning the next major phase

Do not silently expand scope or introduce a framework/infrastructure layer because it is conventional.

The target is a small, maintainable, beautiful application that a developer can understand by reading the source, not an enterprise architecture.
