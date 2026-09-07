# Trinity Grade 7 Scales App — Product Specification v1

**Status:** Draft v1 — ready for Codex implementation planning  
**Product type:** Offline-first Progressive Web App (PWA)  
**Primary device:** Phone, with desktop/tablet support  
**Audience:** One student preparing for Trinity Grade 7 Piano scales and arpeggios

---

## 1. Product summary

Build a small, polished practice app for Trinity Grade 7 Piano scales and arpeggios.

The app should feel like a dedicated music-practice tool rather than a conventional website. It should be installable to a phone as a PWA and usable completely offline after installation. No accounts, authentication, cloud backend, or internet connection should be required for normal use.

The core interaction is a continuous examiner-style practice loop:

1. The app selects one practice card.
2. It displays the requested musical task clearly.
3. It speaks the instruction using a simple female British-English voice when an offline-capable device voice is available.
4. The student plays the requested scale/arpeggio on the piano.
5. The student rates their own performance from 1–10.
6. The score is saved locally.
7. The next card is immediately selected and spoken.
8. Repeat indefinitely until the student leaves the app.

The selection algorithm should use the student's historical scores and review timing to concentrate practice on weaker material while still giving strong material periodic rotation and preserving randomness.

---

## 2. Source of truth for musical content

The attached reference image supplied by the product owner is the source of truth for the v1 syllabus represented in this application.

Do not invent additional musical requirements, fingering, notation, speed targets, or exam rules that are not present in the reference specification.

The image states that the recommended fingering is only a recommendation and that another logical fingering system is acceptable if it is consistent and enables execution of the requirements. The app therefore does not need to teach or enforce fingering in v1.

The image also states that recommended speeds are guides and that accuracy, fluency, evenness of touch and tone are equally important. Speed is therefore informational syllabus metadata only and is not part of the scorecard in v1.

### 2.1 Scales from the reference image

The first three scale rows use:

- Dynamics: **f**, **mf**, **p**, or **crescendo/diminuendo (p–f–p)**
- Articulation: **legato** or **staccato**
- Range: **four octaves**
- Hands: **together**
- Recommended minimum speed: **quarter note = 130**

The scale items are:

1. A-flat major
2. E major
3. G-sharp harmonic minor
4. G-sharp melodic minor
5. E harmonic minor
6. E melodic minor
7. Chromatic scale in similar motion a minor 3rd apart, with left hand starting on C and right hand starting on E-flat

The fourth scale row is a fixed special case:

8. E major scale in 3rds
   - Dynamics: **mf**
   - Articulation: **legato**
   - Range: **two octaves**
   - Hands: **separately**
   - Recommended minimum speed: **quarter note = 70**

### 2.2 Arpeggios from the reference image

The first four arpeggio rows use:

- Dynamics: **f**, **mf**, **p**, or **crescendo/diminuendo (p–f–p)**
- Articulation: **legato** or **staccato**
- Range: **four octaves**
- Hands: **together**
- Recommended minimum speed: **quarter note = 110**
- Motion: similar motion unless specifically otherwise stated in the syllabus

The arpeggio items are:

1. A-flat major
2. E major
3. G-sharp minor
4. E minor
5. Diminished 7th starting on A-flat
6. Diminished 7th starting on E
7. Dominant 7th on the key of A-flat
8. Dominant 7th on the key of E

The fifth arpeggio row is a fixed special case:

9. E major contrary motion
   - Articulation: **legato**
   - Range: **two octaves**
   - Dynamics: none specified in the reference image
   - Hands/motion: contrary motion

### 2.3 Expected card count

A card is one exact combination of:

**musical item + dynamic + articulation**

unless the syllabus row fixes one or both of those attributes, in which case the fixed attributes produce a single card.

Expected v1 card count:

- Scales: **57 cards**
- Arpeggios: **65 cards**
- **Total: 122 cards**

This count should be asserted in automated tests so a transcription or content-generation mistake is detected.

Breakdown:

| Musical item | Card count |
|---|---:|
| A-flat major scale | 8 |
| E major scale | 8 |
| G-sharp harmonic minor scale | 8 |
| G-sharp melodic minor scale | 8 |
| E harmonic minor scale | 8 |
| E melodic minor scale | 8 |
| Chromatic scale, C/E-flat starts | 8 |
| E major scale in 3rds | 1 |
| A-flat major arpeggio | 8 |
| E major arpeggio | 8 |
| G-sharp minor arpeggio | 8 |
| E minor arpeggio | 8 |
| Diminished 7th from A-flat | 8 |
| Diminished 7th from E | 8 |
| Dominant 7th on A-flat | 8 |
| Dominant 7th on E | 8 |
| E major contrary-motion arpeggio | 1 |
| **Total** | **122** |

---

## 3. Definition of a practice card

Each exact combination is independently tracked.

Examples:

- E major scale + staccato + mf
- E major scale + legato + forte

These are two different cards with separate scores, review histories and scheduling state.

This is intentional: a student can be strong at one combination and weak at another, and the application must be able to identify that difference.

### 3.1 Card identity

Every card must have a stable unique ID. The ID should be deterministic from the content rather than generated randomly.

Suggested structure:

```text
scale:e_major:staccato:mf
scale:e_major:legato:f
arpeggio:ab_major:staccato:p
arpeggio:e_major_contrary:legato:none
```

The exact ID format is an implementation detail, but IDs must remain stable across app updates so historical scores are not lost when the content data is updated.

---

## 4. User experience and visual design

The application should feel like a dedicated, elegant music-practice tool.

It should not feel like a form-heavy web application or admin dashboard.

### 4.1 Main practice screen

The practice screen is the default/home screen and should occupy essentially the entire usable screen.

Primary visual elements:

- Large, calm, highly readable instruction area.
- The requested scale/arpeggio prominently displayed as text.
- Dynamics and articulation displayed clearly.
- Optional small supporting information such as “4 octaves · hands together”.
- Score controls at the bottom.
- Minimal navigation to the Analytics view.

The app should prioritize readability at a piano or music stand distance.

Example display:

```text
E major scale

mf · staccato

4 octaves · hands together


How did you play it?

[ 1 ][ 2 ][ 3 ][ 4 ][ 5 ]
[ 6 ][ 7 ][ 8 ][ 9 ][10 ]
```

The exact visual design is up to the implementation, but it should be polished, uncluttered, touch-friendly, and mobile-first.

### 4.2 Score buttons

Use exactly ten large buttons labelled 1–10 arranged as two rows of five.

Requirements:

- Large enough for reliable one-handed phone tapping.
- Clear pressed/selected state.
- Accessible labels and sufficient contrast.
- No separate “Submit” button.
- Selecting a score immediately records the score and advances to the next card.

### 4.3 No unnecessary interaction

Do not introduce:

- A “Next” button.
- A confirmation screen after scoring.
- A “Did you play it?” prompt.
- A session setup screen.
- Required practice duration.
- A timer.
- Accounts or login.

The intended loop is simply:

**Hear → play → score → hear next → play → score.**

---

## 5. Voice behaviour

Voice is part of the core interaction, but the implementation should be deliberately simple in v1.

### 5.1 Voice requirements

Use the device/browser's speech synthesis capabilities where possible.

Preferred voice characteristics:

- Female voice
- English
- British / UK accent
- Clear, natural pronunciation
- Calm, examiner-like delivery

The preferred voice should be selected automatically when a matching installed voice is available, with a sensible fallback when it is not.

The user should not need to configure a voice before starting practice.

### 5.2 Spoken instruction

The spoken instruction should be concise.

Examples:

> “E major. Staccato. Mezzo-forte.”

> “G-sharp harmonic minor. Legato. Piano.”

> “Chromatic scale, left hand starting on C, right hand starting on E-flat. Legato. Forte.”

> “E major in thirds. Legato. Mezzo-forte.”

For crescendo/diminuendo, speak an unambiguous natural-language equivalent of **p–f–p**, for example:

> “Crescendo and diminuendo, piano to forte to piano.”

The textual instruction remains visible while the student plays, so the voice is convenience rather than the only source of information.

### 5.3 Offline voice requirement

Normal app use must not depend on a network connection.

The app should use an offline-capable device speech voice where the platform/browser exposes one. The architecture should isolate the speech layer so a more deterministic packaged-audio implementation can be introduced later without changing the card or practice logic.

If no speech voice is available, the app must continue working and must clearly indicate that voice output is unavailable rather than blocking practice.

Do not call a remote text-to-speech API in v1.

---

## 6. Initial introduction of cards

On first use there is no practice history.

The app must introduce every one of the 122 valid cards exactly once before regular spaced repetition takes over.

Requirements:

- Initial order should be randomized.
- The randomized order should be persisted so closing/reopening the app does not reset the sequence.
- A card becomes “introduced” the first time it is presented.
- The score for that first presentation is recorded normally.
- No special learning score categories are required in the user interface.
- After all cards have been introduced, the regular selection algorithm becomes the sole selector.

If the user has only completed part of the initial pass, resume the remaining cards rather than rebuilding the queue.

---

## 7. Spaced-repetition and card-selection algorithm

The algorithm should be deliberately simpler than Anki, but it must be intelligent enough to direct practice time toward weaker material.

The selection model has four goals, in this order:

1. Prioritize weaker cards based on actual score history.
2. Respect spaced repetition so cards are not repeated immediately forever.
3. Give uncertain/newly learned cards extra attention.
4. Keep some randomness and ensure strong cards continue to rotate.

### 7.1 Score history

For every card, store every self-score with a timestamp.

The card's basic performance metric is the arithmetic mean of its historical scores:

```text
averageScore = sum(all scores) / number of scores
```

Do not replace history with only the latest score.

### 7.2 Review interval

Each card also has a `nextDueAt` timestamp.

Use a simple score-dependent schedule rather than reproducing Anki's full algorithm.

Suggested initial intervals after a review:

| Score | Suggested next interval |
|---:|---:|
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

For subsequent successful reviews, increase the current interval according to the latest score, but cap the interval so a strong card does not disappear forever. A cap of approximately 30 days is appropriate for this exam-preparation use case.

The precise multipliers are an implementation detail, but they should be monotonic: higher scores must never produce a shorter interval than lower scores under otherwise identical conditions.

Example conceptual behaviour:

- Repeated 2s keep a card close to the front of the queue.
- Repeated 6s move it out by days rather than minutes.
- Repeated 9s or 10s push it out substantially but do not remove it from rotation.

### 7.3 Priority score

For cards that are eligible to be considered, calculate a priority using several components.

Suggested normalized components:

```text
weakness      = (10 - averageScore) / 9
uncertainty   = 1 / sqrt(attemptCount)
overdue       = clamp(overdueTime / currentInterval, 0, 1)
recency       = normalized time since last review
randomness    = small random value between 0 and 1
```

Suggested weighting:

```text
priority =
    0.55 * weakness +
    0.20 * overdue +
    0.15 * uncertainty +
    0.05 * recency +
    0.05 * randomness
```

These weights are starting values, not sacred constants. They should be isolated in one configuration module so they can be tuned without rewriting the scheduling system.

### 7.4 Candidate selection

Do not always select the single highest-priority card. That would make the deck feel deterministic and repetitive.

Instead:

1. Build a candidate pool from cards that are due or overdue.
2. Rank candidates by priority.
3. Select from the top portion of that pool using weighted randomness, giving the highest-priority cards the greatest probability.
4. On a minority of turns, include a rotation candidate from the not-yet-due population.

Recommended starting behaviour:

- About **85%** of selections should come from due/overdue cards when due cards exist.
- About **15%** should come from a rotation/exploration pool.

The rotation pool should favour cards that have gone longest since their last review while still allowing any card to be selected.

This is important because the student should not get trapped practising the same five weak cards forever.

### 7.5 No-due-card situation

If no card is currently due:

- Choose from the full card set.
- Prefer lower-average cards and cards with less recent practice.
- Apply a meaningful random component so the sequence is not predictable.

### 7.6 Avoid immediate repeats

The same exact card should not normally be presented twice consecutively.

If the algorithm selects the immediately previous card, re-roll from the candidate pool unless there is no practical alternative.

### 7.7 Algorithm acceptance test

A good implementation should satisfy these behavioural tests:

- A card averaging 4 should appear substantially more often than a card averaging 9, all else equal.
- A newly scored card should not simply reappear every turn.
- A card scoring 9–10 repeatedly should still return periodically.
- A card overdue by a substantial amount should receive increased priority.
- A brand-new card should receive extra attention because its confidence is low.
- Repeatedly scoring a card poorly should cause its review frequency to increase.
- Score history must influence future selection.
- The next card must never be selected from remote/network data.

---

## 8. Data model

Use a local persistent database suitable for a PWA. IndexedDB is the preferred storage mechanism.

A library such as Dexie is acceptable if it reduces implementation complexity and keeps the data layer clean.

### 8.1 Content/card definition

Example conceptual schema:

```ts
CardDefinition {
  id: string
  category: 'scale' | 'arpeggio'
  itemKey: string
  displayName: string
  spokenName: string
  dynamic: 'f' | 'mf' | 'p' | 'crescendo-diminuendo' | null
  articulation: 'legato' | 'staccato' | null
  range: 'four-octaves' | 'two-octaves'
  hands: 'together' | 'separately' | 'contrary-motion'
  motion: 'similar' | 'contrary' | null
  recommendedTempo: string | null
  notes: string | null
}
```

The actual data model may differ, but the content must be declarative and separate from application logic.

### 8.2 Card state

```ts
CardState {
  cardId: string
  introducedAt: timestamp | null
  lastReviewedAt: timestamp | null
  nextDueAt: timestamp | null
  intervalMs: number
  attemptCount: number
  averageScore: number | null
}
```

`averageScore` may be cached for fast display but must be derivable from the attempt history.

### 8.3 Attempt history

```ts
Attempt {
  id: string
  cardId: string
  score: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  timestamp: timestamp
}
```

Never overwrite attempts during normal operation.

### 8.4 App metadata

Store small pieces of app state such as:

- Current schema/content version.
- Initial introduction queue and current position.
- Selected/preferred voice metadata when available.
- Last-used screen.

---

## 9. Analytics screen

The Analytics tab is separate from the main practice screen.

It should not interrupt practice unless the user deliberately navigates to it.

### 9.1 Overall performance

Show a concise overview such as:

- Total attempts.
- Overall average score.
- Number of cards introduced.
- Number of cards with at least one attempt.

### 9.2 Musical items ranked by performance

Show the scales/arpeggios ordered by average score.

The primary view should be **highest average to lowest average**, as requested.

Each row should include at least:

- Musical item name.
- Average score.
- Number of attempts.

Where useful, show a compact visual score indicator.

The aggregation should be at the underlying musical-item level, combining its card variants. For example, all E major scale combinations contribute to the E major scale aggregate.

### 9.3 Exact-card performance

Provide a detailed view of individual cards as well, because the application is learning the exact combinations independently.

Example:

```text
E major — staccato — mf      6.3  (8 attempts)
E major — legato — f         8.9  (7 attempts)
E major — legato — mf        9.2  (6 attempts)
```

This can be a secondary section or expandable detail rather than the first thing shown.

### 9.4 Articulation performance

Show average scores for:

- Legato
- Staccato

Only include attempts from cards that have the relevant articulation.

### 9.5 Dynamics performance

Show average scores for:

- Forte (f)
- Mezzo-forte (mf)
- Piano (p)
- Crescendo/diminuendo (p–f–p)

Only include attempts from cards that have that dynamic as a requested condition.

This lets the student see patterns such as:

> “My staccato average is 6.8, while my legato average is 8.4.”

or

> “I am consistently weaker when asked for crescendo/diminuendo.”

### 9.6 Small-data handling

Do not present misleading averages with no supporting attempts.

For example:

```text
Staccato   7.4   (24 attempts)
Legato     8.1   (31 attempts)
```

If a category has no attempts, display something like “No attempts yet” instead of zero.

---

## 10. Local/offline architecture

The core app must work without an internet connection after installation.

### 10.1 Requirements

- No login.
- No backend server.
- No cloud database.
- No runtime API calls for practice, scoring, analytics, or scheduling.
- Application shell cached for offline use.
- All syllabus/content data bundled with the application.
- All scoring and scheduling stored locally.
- Analytics calculated locally.

### 10.2 PWA requirements

The application should be installable as a PWA on a phone.

Provide:

- Web app manifest.
- Appropriate application name and icons.
- Service worker / offline caching.
- Responsive mobile layout.
- Standalone display mode.
- No dependency on a specific browser tab being open.

The application should feel like a native practice app when launched from the phone home screen.

### 10.3 No CDN dependency

Do not rely on remote fonts, icon libraries, JavaScript bundles, analytics services, or other CDN resources at runtime.

All required assets must be bundled or otherwise available offline.

---

## 11. Data portability and reset

The product is intentionally local-only, so the data layer should be designed for portability even if v1 keeps the UI minimal.

### 11.1 Export/import capability

Implement the persistence model so the complete local state can be serialized to JSON and restored later.

A polished user-facing export/import screen is optional for v1, but the underlying functions should exist or be straightforward to add without redesigning the database.

The exported data should include:

- App/content version.
- Card states.
- Attempt history.
- Relevant app preferences.

### 11.2 Reset history

A reset function should be available somewhere in settings or a low-frequency administrative area.

Resetting must require deliberate confirmation because it destroys the student's history.

Reset should clear:

- Attempts.
- Card states.
- Initial introduction progress.
- Scheduling history.

It must not remove the bundled syllabus definition.

---

## 12. Navigation

Keep navigation minimal.

Suggested structure:

```text
[Practice] [Analytics]
```

Optional settings can be accessed unobtrusively from the app shell.

Practice should always be the default screen.

Returning from Analytics to Practice should preserve the current practice state rather than restarting it.

---

## 13. Accessibility and usability

The app is intended to be used while sitting at a piano, so touch and readability matter more than dense information display.

Requirements:

- Large tap targets.
- Score buttons easy to hit without precision.
- Clear keyboard/screen-reader labels for buttons.
- Dynamic text must remain readable on small screens.
- Do not communicate important information by colour alone.
- Respect the device's reduced-motion preference where practical.
- Avoid animations that delay the next prompt.

The app should remain usable in portrait mode on a typical modern smartphone.

---

## 14. Error handling and resilience

The application must tolerate:

- App closing unexpectedly.
- Browser/tab being suspended.
- Phone being restarted.
- Temporary speech-synthesis failure.
- Database read/write errors.

A score must be persisted before advancing to the next card.

The app should never silently lose a submitted score.

If persistence fails, do not pretend the score was saved. Surface a clear, user-friendly error and avoid moving on until the state is safely handled.

---

## 15. Content and display conventions

Use conventional musical names carefully and consistently.

Suggested display names:

- A-flat major
- E major
- G-sharp harmonic minor
- G-sharp melodic minor
- E harmonic minor
- E melodic minor
- Chromatic scale (LH C / RH E-flat)
- E major in 3rds
- Diminished 7th starting on A-flat
- Dominant 7th on A-flat
- E major contrary-motion arpeggio

For voice, use natural pronunciation rather than reading punctuation or abbreviations literally.

For example:

- `mf` → “mezzo-forte”
- `f` → “forte”
- `p` → “piano”
- `p–f–p` → “piano to forte to piano”

---

## 16. Suggested implementation architecture

The following is guidance, not a requirement to use these exact libraries.

A simple modern stack such as:

- TypeScript
- React
- Vite
- IndexedDB, optionally through Dexie
- PWA/service-worker tooling

would be appropriate.

The project should be divided into clear modules roughly like:

```text
src/
  content/
    syllabus.ts
    cards.ts

  domain/
    scheduler.ts
    scoring.ts
    analytics.ts

  data/
    database.ts
    repositories.ts

  speech/
    speechService.ts

  ui/
    PracticeScreen
    ScoreButtons
    AnalyticsScreen
    Navigation

  app/
    App.tsx
```

The exact folder structure is flexible.

The important architectural rule is:

**musical content, persistence, scheduling logic, speech, analytics, and UI should be separated enough that each can be tested independently.**

---

## 17. Testing requirements

Codex should create automated tests for the important non-visual behaviour.

At minimum test:

### Content

- Syllabus generates exactly 122 cards.
- Every card has a unique stable ID.
- Each expected scale/arpeggio combination exists.
- Fixed special cases produce exactly one card.
- Variable rows produce exactly 8 combinations.

### Scoring/history

- Scores 1–10 are accepted.
- Invalid scores are rejected.
- Attempts are appended, not overwritten.
- Average score is calculated correctly.
- Attempt count is correct.

### Scheduling

- Lower average scores produce higher weakness priority.
- Higher scores produce longer review intervals.
- Overdue cards gain priority.
- New cards receive uncertainty priority.
- Strong cards can still be selected through rotation.
- The same card is not normally selected twice in a row.

### Offline behaviour

- Core app assets can be loaded without network access after installation.
- Card selection does not require network access.
- Scores can be recorded offline.
- Analytics can be viewed offline.

### Persistence

- Closing/reopening restores scores and scheduling state.
- Initial introduction queue resumes correctly.
- Reset clears history but preserves the syllabus.

---

## 18. Definition of done for v1

The v1 implementation is complete when all of the following are true:

1. The application can be installed as a PWA on a phone.
2. The application launches directly into the practice screen.
3. The complete 122-card syllabus is represented from structured local data.
4. On first use, all 122 cards are introduced exactly once in randomized order.
5. Each card displays a clear textual instruction.
6. Each card is spoken aloud when a usable local voice exists.
7. The student can rate the result using ten buttons from 1–10.
8. Tapping a score saves the attempt and immediately advances to the next card.
9. Practice works without an internet connection after installation.
10. Historical scores are retained locally.
11. The scheduler uses those scores to bias future practice toward weaker material.
12. Review timing provides a meaningful spaced-repetition effect.
13. Strong cards continue to reappear periodically.
14. The sequence retains an element of randomness.
15. Analytics show performance by musical item.
16. Analytics show Legato vs Staccato averages.
17. Analytics show f, mf, p, and crescendo/diminuendo averages.
18. Analytics include attempt counts so averages have context.
19. The app contains no login/account/backend requirement.
20. Automated tests cover the syllabus, scheduler, persistence, and core scoring behaviour.

---

## 19. Non-goals for v1

Do not build these unless explicitly requested later:

- User accounts.
- Cloud sync.
- Social sharing.
- Teacher accounts.
- Multiple students.
- Piano audio recognition.
- Automatic pitch/rhythm assessment.
- Microphone recording or grading.
- Metronome.
- Sheet music rendering.
- Fingering tutorials.
- Gamification, points, streaks, badges, leaderboards.
- Complex Anki-style card states.
- Practice timers or session setup.

The app's job is deliberately narrow:

**select an appropriate Trinity Grade 7 scale/arpeggio request, speak it, let the student self-score, learn from that score, and repeat.**

---

## 20. Codex implementation instructions

Treat this document as the product specification and source of truth for v1.

Before writing substantial code:

1. Inspect the repository structure.
2. Convert this specification into an implementation plan.
3. Identify any genuinely blocking ambiguity.
4. Keep the syllabus content in declarative data rather than scattering musical rules throughout the UI.
5. Implement the domain logic and tests before polishing the UI where practical.
6. Keep scheduling weights/constants isolated and easy to tune.
7. Do not introduce network dependencies into the practice loop.
8. Do not add product features merely because they are common in generic flashcard applications.

When there is a choice between a more complicated system and a simpler system that satisfies this specification, prefer the simpler system.

The final result should feel like a purpose-built piano practice companion, not an online flashcard site.
