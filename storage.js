import { createIntroductionQueue } from './scheduler.js';

export const STORAGE_KEY = 'trinity-grade-7-scales:v1';
export const STORAGE_VERSION = 1;

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isScore(value) {
  return Number.isInteger(value) && value >= 1 && value <= 10;
}

function isTimestamp(value) {
  return Number.isFinite(value) && value >= 0;
}

function validCardIds(cardIds) {
  return Array.isArray(cardIds) && cardIds.every((id) => typeof id === 'string' && id.length > 0);
}

function emptyCardState(cardId) {
  return {
    cardId,
    introduced: false,
    introducedAt: null,
    attemptCount: 0,
    historicalAverage: null,
    mostRecentScore: null,
    lastPlayedAt: null,
  };
}

function cleanAttempts(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((attempt) => isRecord(attempt) && isScore(attempt.score) && isTimestamp(attempt.timestamp))
    .map((attempt) => ({ score: attempt.score, timestamp: attempt.timestamp }));
}

export function summariseAttempts(cardId, attempts, previousState = emptyCardState(cardId)) {
  const history = cleanAttempts(attempts);
  if (history.length === 0) {
    return {
      ...emptyCardState(cardId),
      introduced: previousState.introduced === true || isTimestamp(previousState.introducedAt),
      introducedAt: isTimestamp(previousState.introducedAt) ? previousState.introducedAt : null,
    };
  }

  const total = history.reduce((sum, attempt) => sum + attempt.score, 0);
  const latest = history.reduce((latestAttempt, attempt) =>
    attempt.timestamp >= latestAttempt.timestamp ? attempt : latestAttempt,
  );

  return {
    cardId,
    introduced: true,
    introducedAt: isTimestamp(previousState.introducedAt) ? previousState.introducedAt : history[0].timestamp,
    attemptCount: history.length,
    historicalAverage: total / history.length,
    mostRecentScore: latest.score,
    lastPlayedAt: latest.timestamp,
  };
}

function validIntroductionQueue(queue, cardIds) {
  return (
    Array.isArray(queue)
    && queue.length === cardIds.length
    && new Set(queue).size === cardIds.length
    && queue.every((cardId) => cardIds.includes(cardId))
  );
}

function cleanRetryQueue(value, cardIds) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.filter((entry) => {
    if (!isRecord(entry) || !cardIds.includes(entry.cardId) || !Number.isInteger(entry.eligibleAfterScoreCount)) {
      return false;
    }
    if (seen.has(entry.cardId)) return false;
    seen.add(entry.cardId);
    return true;
  }).map((entry) => ({
    cardId: entry.cardId,
    eligibleAfterScoreCount: Math.max(0, entry.eligibleAfterScoreCount),
  }));
}

function cloneAttempts(attempts) {
  return Object.fromEntries(
    Object.entries(attempts).map(([cardId, history]) => [
      cardId,
      history.map((attempt) => ({ ...attempt })),
    ]),
  );
}

export function cloneAppState(state) {
  return {
    ...state,
    attempts: cloneAttempts(state.attempts),
    states: Object.fromEntries(Object.entries(state.states).map(([cardId, cardState]) => [cardId, { ...cardState }])),
    introductionQueue: [...state.introductionQueue],
    retryQueue: state.retryQueue.map((entry) => ({ ...entry })),
    settings: { ...state.settings },
  };
}

export function createInitialAppState(cardIds, rng = Math.random) {
  if (!validCardIds(cardIds) || new Set(cardIds).size !== cardIds.length) {
    throw new Error('A unique list of card IDs is required to create app state.');
  }

  return {
    version: STORAGE_VERSION,
    attempts: Object.fromEntries(cardIds.map((cardId) => [cardId, []])),
    states: Object.fromEntries(cardIds.map((cardId) => [cardId, emptyCardState(cardId)])),
    introductionQueue: createIntroductionQueue(cardIds, rng),
    introductionPosition: 0,
    retryQueue: [],
    activePromptCardId: null,
    lastCardId: null,
    lastScreen: 'practice',
    settings: { speechEnabled: true },
  };
}

/**
 * Safely converts missing, malformed, and older compatible storage into the
 * current state shape. Attempts remain the source of truth for summaries.
 */
export function normaliseAppState(candidate, cardIds, rng = Math.random) {
  const base = createInitialAppState(cardIds, rng);
  if (!isRecord(candidate)) return base;

  const rawAttempts = isRecord(candidate.attempts) ? candidate.attempts : {};
  const rawStates = isRecord(candidate.states) ? candidate.states : {};
  const attempts = {};
  const states = {};

  for (const cardId of cardIds) {
    attempts[cardId] = cleanAttempts(rawAttempts[cardId]);
    states[cardId] = summariseAttempts(cardId, attempts[cardId], isRecord(rawStates[cardId]) ? rawStates[cardId] : emptyCardState(cardId));
  }

  const introductionQueue = validIntroductionQueue(candidate.introductionQueue, cardIds)
    ? [...candidate.introductionQueue]
    : base.introductionQueue;
  const introductionPosition = Number.isInteger(candidate.introductionPosition)
    ? Math.min(Math.max(candidate.introductionPosition, 0), introductionQueue.length)
    : 0;
  const activePromptCardId = cardIds.includes(candidate.activePromptCardId)
    ? candidate.activePromptCardId
    : null;

  return {
    version: STORAGE_VERSION,
    attempts,
    states,
    introductionQueue,
    introductionPosition,
    retryQueue: cleanRetryQueue(candidate.retryQueue, cardIds),
    activePromptCardId,
    lastCardId: cardIds.includes(candidate.lastCardId) ? candidate.lastCardId : null,
    lastScreen: candidate.lastScreen === 'analytics' ? 'analytics' : 'practice',
    settings: {
      speechEnabled: candidate.settings?.speechEnabled !== false,
    },
  };
}

export function loadAppState(storage, cardIds, rng = Math.random) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (raw === null || raw === undefined) return createInitialAppState(cardIds, rng);
    return normaliseAppState(JSON.parse(raw), cardIds, rng);
  } catch {
    return createInitialAppState(cardIds, rng);
  }
}

export function saveAppState(storage, state) {
  if (!storage || typeof storage.setItem !== 'function') {
    throw new Error('Local storage is unavailable.');
  }
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetAppState(storage, cardIds, rng = Math.random) {
  const state = createInitialAppState(cardIds, rng);
  saveAppState(storage, state);
  return state;
}

export function getTotalAttemptCount(state) {
  return Object.values(state.attempts).reduce((total, history) => total + history.length, 0);
}
