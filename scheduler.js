/*
 * Phase 2 adaptive practice scheduler.
 *
 * This module is intentionally pure: callers provide card state, the current
 * time, and an RNG. It does not read storage or render a user interface.
 */

export const SCHEDULER_CONFIG = Object.freeze({
  historicalAverageWeight: 0.8,
  mostRecentScoreWeight: 0.2,
  urgentRetryMaximumScore: 3,
  urgentRetryMinimumDelay: 2,
  urgentRetryMaximumDelay: 4,
  recencyHoursToMaximum: 24,
  maximumRecencyBonus: 2,
  minimumSelectionWeight: 0.001,
});

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function isScore(value) {
  return Number.isFinite(value) && value >= 1 && value <= 10;
}

function rngValue(rng) {
  const value = rng();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('Scheduler RNG must return a number in [0, 1).');
  }
  return value;
}

function getAverageScore(cardState) {
  const average = cardState.historicalAverage ?? cardState.averageScore;
  return isScore(average) ? average : null;
}

function getMostRecentScore(cardState) {
  const score = cardState.mostRecentScore ?? cardState.lastScore;
  return isScore(score) ? score : null;
}

function getLastPlayedAt(cardState) {
  const timestamp = cardState.lastPlayedAt ?? cardState.lastReviewedAt;
  return Number.isFinite(timestamp) ? timestamp : null;
}

function isIntroduced(cardState) {
  return cardState.introduced === true || Number.isFinite(cardState.introducedAt);
}

function hasAttemptHistory(cardState) {
  return Number.isInteger(cardState.attemptCount) && cardState.attemptCount > 0;
}

function withoutImmediateRepeat(candidates, lastCardId) {
  const alternatives = candidates.filter((candidate) => candidate.cardId !== lastCardId);
  return alternatives.length > 0 ? alternatives : candidates;
}

function randomIntegerInclusive(minimum, maximum, rng) {
  return minimum + Math.floor(rngValue(rng) * (maximum - minimum + 1));
}

function currentIntroductionCard(introductionQueue, introductionPosition) {
  if (!Array.isArray(introductionQueue)) return null;
  const position = Number.isInteger(introductionPosition) && introductionPosition >= 0
    ? introductionPosition
    : 0;
  return introductionQueue[position] ?? null;
}

/**
 * Creates a shuffled first-pass queue without mutating the supplied IDs.
 */
export function createIntroductionQueue(cardIds, rng = Math.random) {
  if (!Array.isArray(cardIds)) {
    throw new TypeError('Card IDs must be provided as an array.');
  }
  if (new Set(cardIds).size !== cardIds.length) {
    throw new Error('Introduction queue cannot contain duplicate card IDs.');
  }

  const queue = [...cardIds];
  for (let index = queue.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rngValue(rng) * (index + 1));
    [queue[index], queue[swapIndex]] = [queue[swapIndex], queue[index]];
  }
  return queue;
}

/**
 * Advances a first-pass queue after its current card has been scored.
 */
export function advanceIntroductionQueue(introductionQueue, introductionPosition = 0) {
  if (!Array.isArray(introductionQueue)) {
    throw new TypeError('Introduction queue must be an array.');
  }
  const position = Number.isInteger(introductionPosition) && introductionPosition >= 0
    ? introductionPosition
    : 0;
  const nextPosition = Math.min(position + 1, introductionQueue.length);
  return {
    position: nextPosition,
    cardId: introductionQueue[nextPosition] ?? null,
    isComplete: nextPosition >= introductionQueue.length,
  };
}

/**
 * Uses the historical average with a modest adjustment for the last score.
 * State may use either `historicalAverage`/`mostRecentScore` or the equivalent
 * future persistence names `averageScore`/`lastScore`.
 */
export function calculateEffectiveScore(cardState) {
  if (!cardState || !hasAttemptHistory(cardState)) return null;

  const average = getAverageScore(cardState);
  const mostRecent = getMostRecentScore(cardState);

  if (cardState.attemptCount === 1) return mostRecent ?? average;
  if (average === null) return mostRecent;
  if (mostRecent === null) return average;

  return (
    SCHEDULER_CONFIG.historicalAverageWeight * average
    + SCHEDULER_CONFIG.mostRecentScoreWeight * mostRecent
  );
}

export function calculateWeakness(cardState) {
  const effectiveScore = calculateEffectiveScore(cardState);
  return effectiveScore === null ? null : 11 - effectiveScore;
}

/**
 * Returns a value from 0 to 1. Cards without a last-played timestamp are
 * treated as fully old; normal selection still excludes unattempted cards.
 */
export function calculateRecencyFactor(cardState, now) {
  if (!Number.isFinite(now)) return 0;
  const lastPlayedAt = getLastPlayedAt(cardState ?? {});
  if (lastPlayedAt === null) return 1;

  const elapsedMs = Math.max(0, now - lastPlayedAt);
  const maximumMs = SCHEDULER_CONFIG.recencyHoursToMaximum * 60 * 60 * 1000;
  return clamp(elapsedMs / maximumMs, 0, 1);
}

/**
 * Normal weights remain positive even for consistently strong cards.
 */
export function calculateSelectionWeight(cardState, now) {
  const weakness = calculateWeakness(cardState);
  if (weakness === null) return SCHEDULER_CONFIG.minimumSelectionWeight;

  const recencyBonus = SCHEDULER_CONFIG.maximumRecencyBonus
    * calculateRecencyFactor(cardState, now);
  return Math.max(SCHEDULER_CONFIG.minimumSelectionWeight, weakness + recencyBonus);
}

export function isUrgentRetryScore(score) {
  return Number.isInteger(score) && score >= 1 && score <= SCHEDULER_CONFIG.urgentRetryMaximumScore;
}

/**
 * Adds a failed card to the retry queue. `completedScoreCount` includes the
 * failed score, so a delay of 2 produces two other scored cards before retry.
 */
export function enqueueUrgentRetry(retryQueue, cardId, score, completedScoreCount, rng = Math.random) {
  const queue = Array.isArray(retryQueue) ? [...retryQueue] : [];
  if (!isUrgentRetryScore(score)) return queue;
  if (queue.some((entry) => entry.cardId === cardId)) return queue;

  const delay = randomIntegerInclusive(
    SCHEDULER_CONFIG.urgentRetryMinimumDelay,
    SCHEDULER_CONFIG.urgentRetryMaximumDelay,
    rng,
  );
  const completedCount = Number.isInteger(completedScoreCount) && completedScoreCount >= 0
    ? completedScoreCount
    : 0;

  return [
    ...queue,
    {
      cardId,
      eligibleAfterScoreCount: completedCount + delay,
    },
  ];
}

/**
 * Selects one candidate proportionally to its positive weight.
 */
export function selectWeightedCard(candidates, rng = Math.random, getWeight = (candidate) => candidate.weight) {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;

  const weightedCandidates = candidates.map((candidate) => ({
    candidate,
    weight: Math.max(0, Number(getWeight(candidate)) || 0),
  }));
  const totalWeight = weightedCandidates.reduce((total, entry) => total + entry.weight, 0);
  if (totalWeight <= 0) return candidates[Math.floor(rngValue(rng) * candidates.length)];

  let threshold = rngValue(rng) * totalWeight;
  for (const entry of weightedCandidates) {
    threshold -= entry.weight;
    if (threshold < 0) return entry.candidate;
  }
  return weightedCandidates[weightedCandidates.length - 1].candidate;
}

/**
 * Picks the next card without modifying its inputs.
 *
 * `introductionPosition` points to the current unintroduced queue item. The
 * caller advances that position only after the item is scored.
 */
export function selectNextCard(input, now, rng = Math.random) {
  const {
    cardStates = [],
    retryQueue = [],
    introductionQueue = [],
    introductionPosition = 0,
    lastCardId = null,
    completedScoreCount = 0,
  } = input ?? {};

  const states = Array.isArray(cardStates) ? cardStates : [];
  const stateById = new Map(states.map((state) => [state.cardId, state]));
  const queue = Array.isArray(retryQueue) ? retryQueue : [];
  const completedCount = Number.isInteger(completedScoreCount) && completedScoreCount >= 0
    ? completedScoreCount
    : 0;

  const eligibleRetries = queue.filter((entry) =>
    entry.eligibleAfterScoreCount <= completedCount && stateById.has(entry.cardId),
  );
  const retryCandidates = withoutImmediateRepeat(
    eligibleRetries.map((entry) => ({ cardId: entry.cardId, entry })),
    lastCardId,
  );

  if (retryCandidates.length > 0 && retryCandidates.some((candidate) => candidate.cardId !== lastCardId)) {
    const selected = selectWeightedCard(retryCandidates, rng, () => 1);
    return {
      cardId: selected.cardId,
      source: 'urgent-retry',
      retryQueue: queue.filter((entry) => entry.cardId !== selected.cardId),
    };
  }

  const introductionCardId = currentIntroductionCard(introductionQueue, introductionPosition);
  if (introductionCardId !== null) {
    return {
      cardId: introductionCardId,
      source: 'introduction',
      retryQueue: [...queue],
    };
  }

  const queuedRetryIds = new Set(queue.map((entry) => entry.cardId));
  const normalCandidates = states.filter((state) =>
    isIntroduced(state) && hasAttemptHistory(state) && !queuedRetryIds.has(state.cardId),
  );
  const normalOptions = withoutImmediateRepeat(normalCandidates, lastCardId);
  const selectedNormal = selectWeightedCard(
    normalOptions,
    rng,
    (state) => calculateSelectionWeight(state, now),
  );

  if (selectedNormal !== null) {
    return {
      cardId: selectedNormal.cardId,
      source: 'normal',
      retryQueue: [...queue],
    };
  }

  // A one-card deck or malformed future state should not leave the scheduler
  // permanently unable to return a card. This only bypasses retry delay when
  // there is no practical alternative.
  const fallback = states.find((state) => isIntroduced(state) && hasAttemptHistory(state));
  if (fallback !== undefined) {
    return {
      cardId: fallback.cardId,
      source: queuedRetryIds.has(fallback.cardId) ? 'urgent-retry' : 'normal',
      retryQueue: queue.filter((entry) => entry.cardId !== fallback.cardId),
    };
  }

  return {
    cardId: null,
    source: 'none',
    retryQueue: [...queue],
  };
}
