import {
  advanceIntroductionQueue,
  enqueueUrgentRetry,
  selectNextCard,
} from './scheduler.js';
import {
  cloneAppState,
  getTotalAttemptCount,
  summariseAttempts,
} from './storage.js';

function validScore(score) {
  return Number.isInteger(score) && score >= 1 && score <= 10;
}

function cardStates(state) {
  return Object.values(state.states);
}

function markCardPresented(state, cardId, now) {
  const existing = state.states[cardId];
  if (!existing) throw new Error(`Unknown practice card: ${cardId}`);
  if (!existing.introduced) {
    state.states[cardId] = {
      ...existing,
      introduced: true,
      introducedAt: now,
    };
  }
}

/**
 * Creates an active prompt when one is not already persisted. It returns a new
 * state and never performs I/O, so callers can persist before displaying it.
 */
export function ensureActivePrompt(state, now, rng = Math.random) {
  if (state.activePromptCardId && state.states[state.activePromptCardId]) return state;

  const next = cloneAppState(state);
  const selection = selectNextCard({
    cardStates: cardStates(next),
    retryQueue: next.retryQueue,
    introductionQueue: next.introductionQueue,
    introductionPosition: next.introductionPosition,
    lastCardId: next.lastCardId,
    completedScoreCount: getTotalAttemptCount(next),
  }, now, rng);

  if (selection.cardId === null) {
    throw new Error('The scheduler could not select a practice card.');
  }

  next.activePromptCardId = selection.cardId;
  next.retryQueue = selection.retryQueue;
  markCardPresented(next, selection.cardId, now);
  return next;
}

/**
 * Records one score for the currently displayed prompt and immediately creates
 * the next active prompt. A stale prompt ID is rejected to prevent duplicate
 * double-tap events from being recorded against a later card.
 */
export function scorePrompt(state, promptCardId, score, now, rng = Math.random) {
  if (!validScore(score)) throw new RangeError('Practice scores must be whole numbers from 1 to 10.');
  if (!state.activePromptCardId || state.activePromptCardId !== promptCardId) {
    throw new Error('This practice prompt is no longer active.');
  }

  const next = cloneAppState(state);
  const history = [...next.attempts[promptCardId], { score, timestamp: now }];
  next.attempts[promptCardId] = history;
  next.states[promptCardId] = summariseAttempts(promptCardId, history, next.states[promptCardId]);
  next.lastCardId = promptCardId;
  next.activePromptCardId = null;

  const currentIntroductionCard = next.introductionQueue[next.introductionPosition] ?? null;
  if (currentIntroductionCard === promptCardId) {
    next.introductionPosition = advanceIntroductionQueue(
      next.introductionQueue,
      next.introductionPosition,
    ).position;
  }

  next.retryQueue = enqueueUrgentRetry(
    next.retryQueue,
    promptCardId,
    score,
    getTotalAttemptCount(next),
    rng,
  );

  return ensureActivePrompt(next, now, rng);
}
