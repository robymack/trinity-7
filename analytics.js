const DYNAMIC_LABELS = {
  f: 'Forte',
  mf: 'Mezzo-forte',
  p: 'Piano',
  'crescendo-diminuendo': 'Crescendo/diminuendo',
};

function average(values) {
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function attemptsFor(state, cardId) {
  return Array.isArray(state.attempts[cardId]) ? state.attempts[cardId] : [];
}

function summaryForAttempts(attempts) {
  const scores = attempts.map((attempt) => attempt.score);
  return { average: average(scores), attemptCount: scores.length };
}

function compareByPerformance(a, b) {
  if (a.average === null && b.average === null) return a.name.localeCompare(b.name);
  if (a.average === null) return 1;
  if (b.average === null) return -1;
  return a.average - b.average || a.name.localeCompare(b.name);
}

export function buildAnalytics(cards, state) {
  const allAttempts = cards.flatMap((card) => attemptsFor(state, card.id));
  const itemMap = new Map();

  for (const card of cards) {
    if (!itemMap.has(card.syllabusItemId)) {
      itemMap.set(card.syllabusItemId, {
        itemId: card.syllabusItemId,
        name: card.name,
        category: card.category,
        attempts: [],
      });
    }
    itemMap.get(card.syllabusItemId).attempts.push(...attemptsFor(state, card.id));
  }

  const items = [...itemMap.values()].map((item) => ({
    itemId: item.itemId,
    name: item.name,
    category: item.category,
    ...summaryForAttempts(item.attempts),
  })).sort(compareByPerformance);

  const exactCards = cards.map((card) => ({
    ...card,
    ...summaryForAttempts(attemptsFor(state, card.id)),
  })).sort(compareByPerformance);

  const articulation = ['legato', 'staccato'].map((name) => {
    const attempts = cards
      .filter((card) => card.articulation === name)
      .flatMap((card) => attemptsFor(state, card.id));
    return { name: name[0].toUpperCase() + name.slice(1), ...summaryForAttempts(attempts) };
  });

  const dynamics = Object.entries(DYNAMIC_LABELS).map(([dynamic, name]) => {
    const attempts = cards
      .filter((card) => card.dynamic === dynamic)
      .flatMap((card) => attemptsFor(state, card.id));
    return { dynamic, name, ...summaryForAttempts(attempts) };
  });

  return {
    totalAttempts: allAttempts.length,
    overallAverage: average(allAttempts.map((attempt) => attempt.score)),
    introducedCards: cards.filter((card) => state.states[card.id]?.introduced).length,
    attemptedCards: cards.filter((card) => attemptsFor(state, card.id).length > 0).length,
    items,
    exactCards,
    articulation,
    dynamics,
  };
}
