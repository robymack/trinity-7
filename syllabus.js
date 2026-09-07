/**
 * Grade 7 syllabus content and deterministic card generation.
 *
 * The musical source image is the ultimate authority. This transcription is
 * based on the written Grade 7 requirements and must be checked against that
 * image before release; no fingering, notes, or unlisted exam rules are added.
 */

export const DYNAMICS = Object.freeze([
  'f',
  'mf',
  'p',
  'crescendo-diminuendo',
]);

export const ARTICULATIONS = Object.freeze(['legato', 'staccato']);

export const EXPECTED_CARD_COUNT = 122;

export const EXPECTED_CARD_COUNTS_BY_GROUP = Object.freeze({
  'standard-scales': 56,
  'special-scales': 1,
  'standard-arpeggios': 64,
  'special-arpeggios': 1,
});

const STANDARD_DYNAMICS = Object.freeze([
  'f',
  'mf',
  'p',
  'crescendo-diminuendo',
]);

const STANDARD_ARTICULATIONS = Object.freeze(['legato', 'staccato']);

/**
 * One entry describes an underlying musical item, not an individual practice
 * card. `motion: null` means the written requirements do not state a motion.
 */
export const GRADE_7_SYLLABUS = Object.freeze([
  {
    id: 'a-flat-major-scale',
    group: 'standard-scales',
    category: 'scale',
    name: 'A-flat major scale',
    spokenName: 'A-flat major scale',
    form: 'standard',
    octaves: 4,
    hands: 'together',
    motion: null,
    recommendedTempoQpm: 130,
    allowedDynamics: STANDARD_DYNAMICS,
    allowedArticulations: STANDARD_ARTICULATIONS,
  },
  {
    id: 'e-major-scale',
    group: 'standard-scales',
    category: 'scale',
    name: 'E major scale',
    spokenName: 'E major scale',
    form: 'standard',
    octaves: 4,
    hands: 'together',
    motion: null,
    recommendedTempoQpm: 130,
    allowedDynamics: STANDARD_DYNAMICS,
    allowedArticulations: STANDARD_ARTICULATIONS,
  },
  {
    id: 'g-sharp-harmonic-minor-scale',
    group: 'standard-scales',
    category: 'scale',
    name: 'G-sharp harmonic minor scale',
    spokenName: 'G-sharp harmonic minor scale',
    form: 'standard',
    octaves: 4,
    hands: 'together',
    motion: null,
    recommendedTempoQpm: 130,
    allowedDynamics: STANDARD_DYNAMICS,
    allowedArticulations: STANDARD_ARTICULATIONS,
  },
  {
    id: 'g-sharp-melodic-minor-scale',
    group: 'standard-scales',
    category: 'scale',
    name: 'G-sharp melodic minor scale',
    spokenName: 'G-sharp melodic minor scale',
    form: 'standard',
    octaves: 4,
    hands: 'together',
    motion: null,
    recommendedTempoQpm: 130,
    allowedDynamics: STANDARD_DYNAMICS,
    allowedArticulations: STANDARD_ARTICULATIONS,
  },
  {
    id: 'e-harmonic-minor-scale',
    group: 'standard-scales',
    category: 'scale',
    name: 'E harmonic minor scale',
    spokenName: 'E harmonic minor scale',
    form: 'standard',
    octaves: 4,
    hands: 'together',
    motion: null,
    recommendedTempoQpm: 130,
    allowedDynamics: STANDARD_DYNAMICS,
    allowedArticulations: STANDARD_ARTICULATIONS,
  },
  {
    id: 'e-melodic-minor-scale',
    group: 'standard-scales',
    category: 'scale',
    name: 'E melodic minor scale',
    spokenName: 'E melodic minor scale',
    form: 'standard',
    octaves: 4,
    hands: 'together',
    motion: null,
    recommendedTempoQpm: 130,
    allowedDynamics: STANDARD_DYNAMICS,
    allowedArticulations: STANDARD_ARTICULATIONS,
  },
  {
    id: 'chromatic-scale-lh-c-rh-e-flat',
    group: 'standard-scales',
    category: 'scale',
    name: 'Chromatic scale (LH C / RH E-flat)',
    spokenName: 'Chromatic scale, left hand starting on C, right hand starting on E-flat',
    form: 'chromatic',
    octaves: 4,
    hands: 'together',
    motion: 'similar',
    recommendedTempoQpm: 130,
    startingPositions: {
      leftHand: 'C',
      rightHand: 'E-flat',
    },
    allowedDynamics: STANDARD_DYNAMICS,
    allowedArticulations: STANDARD_ARTICULATIONS,
  },
  {
    id: 'e-major-scale-in-thirds',
    group: 'special-scales',
    category: 'scale',
    name: 'E major scale in 3rds',
    spokenName: 'E major scale in thirds',
    form: 'in-thirds',
    octaves: 2,
    hands: 'separately',
    motion: null,
    recommendedTempoQpm: 70,
    allowedDynamics: ['mf'],
    allowedArticulations: ['legato'],
  },
  {
    id: 'a-flat-major-arpeggio',
    group: 'standard-arpeggios',
    category: 'arpeggio',
    name: 'A-flat major arpeggio',
    spokenName: 'A-flat major arpeggio',
    form: 'standard',
    octaves: 4,
    hands: 'together',
    motion: 'similar',
    recommendedTempoQpm: 110,
    allowedDynamics: STANDARD_DYNAMICS,
    allowedArticulations: STANDARD_ARTICULATIONS,
  },
  {
    id: 'e-major-arpeggio',
    group: 'standard-arpeggios',
    category: 'arpeggio',
    name: 'E major arpeggio',
    spokenName: 'E major arpeggio',
    form: 'standard',
    octaves: 4,
    hands: 'together',
    motion: 'similar',
    recommendedTempoQpm: 110,
    allowedDynamics: STANDARD_DYNAMICS,
    allowedArticulations: STANDARD_ARTICULATIONS,
  },
  {
    id: 'g-sharp-minor-arpeggio',
    group: 'standard-arpeggios',
    category: 'arpeggio',
    name: 'G-sharp minor arpeggio',
    spokenName: 'G-sharp minor arpeggio',
    form: 'standard',
    octaves: 4,
    hands: 'together',
    motion: 'similar',
    recommendedTempoQpm: 110,
    allowedDynamics: STANDARD_DYNAMICS,
    allowedArticulations: STANDARD_ARTICULATIONS,
  },
  {
    id: 'e-minor-arpeggio',
    group: 'standard-arpeggios',
    category: 'arpeggio',
    name: 'E minor arpeggio',
    spokenName: 'E minor arpeggio',
    form: 'standard',
    octaves: 4,
    hands: 'together',
    motion: 'similar',
    recommendedTempoQpm: 110,
    allowedDynamics: STANDARD_DYNAMICS,
    allowedArticulations: STANDARD_ARTICULATIONS,
  },
  {
    id: 'diminished-seventh-starting-a-flat',
    group: 'standard-arpeggios',
    category: 'arpeggio',
    name: 'Diminished 7th starting on A-flat',
    spokenName: 'Diminished seventh starting on A-flat',
    form: 'diminished-seventh',
    octaves: 4,
    hands: 'together',
    motion: 'similar',
    recommendedTempoQpm: 110,
    allowedDynamics: STANDARD_DYNAMICS,
    allowedArticulations: STANDARD_ARTICULATIONS,
  },
  {
    id: 'diminished-seventh-starting-e',
    group: 'standard-arpeggios',
    category: 'arpeggio',
    name: 'Diminished 7th starting on E',
    spokenName: 'Diminished seventh starting on E',
    form: 'diminished-seventh',
    octaves: 4,
    hands: 'together',
    motion: 'similar',
    recommendedTempoQpm: 110,
    allowedDynamics: STANDARD_DYNAMICS,
    allowedArticulations: STANDARD_ARTICULATIONS,
  },
  {
    id: 'dominant-seventh-on-a-flat',
    group: 'standard-arpeggios',
    category: 'arpeggio',
    name: 'Dominant 7th on A-flat',
    spokenName: 'Dominant seventh on A-flat',
    form: 'dominant-seventh',
    octaves: 4,
    hands: 'together',
    motion: 'similar',
    recommendedTempoQpm: 110,
    allowedDynamics: STANDARD_DYNAMICS,
    allowedArticulations: STANDARD_ARTICULATIONS,
  },
  {
    id: 'dominant-seventh-on-e',
    group: 'standard-arpeggios',
    category: 'arpeggio',
    name: 'Dominant 7th on E',
    spokenName: 'Dominant seventh on E',
    form: 'dominant-seventh',
    octaves: 4,
    hands: 'together',
    motion: 'similar',
    recommendedTempoQpm: 110,
    allowedDynamics: STANDARD_DYNAMICS,
    allowedArticulations: STANDARD_ARTICULATIONS,
  },
  {
    id: 'e-major-contrary-motion',
    group: 'special-arpeggios',
    category: 'arpeggio',
    name: 'E major contrary-motion arpeggio',
    spokenName: 'E major contrary-motion arpeggio',
    form: 'contrary-motion',
    octaves: 2,
    hands: 'contrary-motion',
    motion: 'contrary',
    recommendedTempoQpm: null,
    allowedDynamics: [null],
    allowedArticulations: ['legato'],
  },
]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Syllabus validation failed: ${message}`);
  }
}

function hasOnlyUniqueValues(values) {
  return new Set(values).size === values.length;
}

function dynamicIdPart(dynamic) {
  return dynamic ?? 'none';
}

export function createCardId(item, articulation, dynamic) {
  return `${item.category}:${item.id}:${articulation}:${dynamicIdPart(dynamic)}`;
}

export function validateSyllabus(syllabus) {
  assert(Array.isArray(syllabus), 'syllabus must be an array');
  assert(syllabus.length === 17, 'syllabus must define exactly 17 musical items');

  const itemIds = syllabus.map((item) => item.id);
  assert(hasOnlyUniqueValues(itemIds), 'musical-item IDs must be unique');

  for (const item of syllabus) {
    assert(typeof item.id === 'string' && /^[a-z0-9-]+$/.test(item.id), `${item.id}: invalid item ID`);
    assert(typeof item.group === 'string' && item.group in EXPECTED_CARD_COUNTS_BY_GROUP, `${item.id}: invalid group`);
    assert(item.category === 'scale' || item.category === 'arpeggio', `${item.id}: invalid category`);
    assert(typeof item.name === 'string' && item.name.length > 0, `${item.id}: name is required`);
    assert(typeof item.spokenName === 'string' && item.spokenName.length > 0, `${item.id}: spokenName is required`);
    assert(typeof item.form === 'string' && item.form.length > 0, `${item.id}: form is required`);
    assert(item.octaves === 2 || item.octaves === 4, `${item.id}: octaves must be 2 or 4`);
    assert(typeof item.hands === 'string' && item.hands.length > 0, `${item.id}: hands is required`);
    assert(item.motion === null || item.motion === 'similar' || item.motion === 'contrary', `${item.id}: invalid motion`);
    assert(
      item.recommendedTempoQpm === null || Number.isFinite(item.recommendedTempoQpm),
      `${item.id}: invalid recommended tempo`,
    );
    assert(Array.isArray(item.allowedDynamics) && item.allowedDynamics.length > 0, `${item.id}: dynamics are required`);
    assert(Array.isArray(item.allowedArticulations) && item.allowedArticulations.length > 0, `${item.id}: articulations are required`);
    assert(hasOnlyUniqueValues(item.allowedDynamics), `${item.id}: duplicate dynamics`);
    assert(hasOnlyUniqueValues(item.allowedArticulations), `${item.id}: duplicate articulations`);

    const hasNoDynamicRequirement = item.allowedDynamics.includes(null);
    assert(
      !hasNoDynamicRequirement || item.allowedDynamics.length === 1,
      `${item.id}: null dynamic cannot be combined with requested dynamics`,
    );

    for (const dynamic of item.allowedDynamics) {
      assert(dynamic === null || DYNAMICS.includes(dynamic), `${item.id}: invalid dynamic ${dynamic}`);
    }
    for (const articulation of item.allowedArticulations) {
      assert(ARTICULATIONS.includes(articulation), `${item.id}: invalid articulation ${articulation}`);
    }
  }

  return true;
}

export function generateCards(syllabus) {
  validateSyllabus(syllabus);

  return syllabus.flatMap((item) =>
    item.allowedArticulations.flatMap((articulation) =>
      item.allowedDynamics.map((dynamic) => ({
        id: createCardId(item, articulation, dynamic),
        syllabusItemId: item.id,
        group: item.group,
        category: item.category,
        name: item.name,
        spokenName: item.spokenName,
        form: item.form,
        octaves: item.octaves,
        hands: item.hands,
        motion: item.motion,
        recommendedTempoQpm: item.recommendedTempoQpm,
        startingPositions: item.startingPositions ?? null,
        articulation,
        dynamic,
      })),
    ),
  );
}

export function getCardCountsByGroup(cards) {
  return cards.reduce((counts, card) => {
    counts[card.group] = (counts[card.group] ?? 0) + 1;
    return counts;
  }, {});
}

function validateCardCoverage(syllabus, cards) {
  for (const item of syllabus) {
    const itemCards = cards.filter((card) => card.syllabusItemId === item.id);
    const expectedCount = item.allowedArticulations.length * item.allowedDynamics.length;
    assert(itemCards.length === expectedCount, `${item.id}: incorrect generated card count`);

    for (const articulation of item.allowedArticulations) {
      for (const dynamic of item.allowedDynamics) {
        const expectedId = createCardId(item, articulation, dynamic);
        assert(
          itemCards.some((card) => card.id === expectedId),
          `${item.id}: missing ${articulation}/${dynamicIdPart(dynamic)} card`,
        );
      }
    }
  }
}

export function validateCards(cards, syllabus = GRADE_7_SYLLABUS) {
  assert(Array.isArray(cards), 'generated cards must be an array');
  assert(cards.length === EXPECTED_CARD_COUNT, `expected ${EXPECTED_CARD_COUNT} cards, received ${cards.length}`);

  const cardIds = cards.map((card) => card.id);
  assert(hasOnlyUniqueValues(cardIds), 'generated card IDs must be unique');

  for (const card of cards) {
    assert(typeof card.id === 'string' && card.id.length > 0, 'card ID is required');
    assert(typeof card.syllabusItemId === 'string' && card.syllabusItemId.length > 0, `${card.id}: syllabusItemId is required`);
    assert(card.category === 'scale' || card.category === 'arpeggio', `${card.id}: invalid category`);
    assert(typeof card.name === 'string' && card.name.length > 0, `${card.id}: name is required`);
    assert(typeof card.spokenName === 'string' && card.spokenName.length > 0, `${card.id}: spokenName is required`);
    assert(typeof card.form === 'string' && card.form.length > 0, `${card.id}: form is required`);
    assert(card.octaves === 2 || card.octaves === 4, `${card.id}: invalid octaves`);
    assert(typeof card.hands === 'string' && card.hands.length > 0, `${card.id}: hands is required`);
    assert(card.motion === null || card.motion === 'similar' || card.motion === 'contrary', `${card.id}: invalid motion`);
    assert(
      card.recommendedTempoQpm === null || Number.isFinite(card.recommendedTempoQpm),
      `${card.id}: invalid recommended tempo`,
    );
    assert(ARTICULATIONS.includes(card.articulation), `${card.id}: invalid articulation`);
    assert(card.dynamic === null || DYNAMICS.includes(card.dynamic), `${card.id}: invalid dynamic`);
  }

  const counts = getCardCountsByGroup(cards);
  for (const [group, expectedCount] of Object.entries(EXPECTED_CARD_COUNTS_BY_GROUP)) {
    assert(counts[group] === expectedCount, `${group}: expected ${expectedCount} cards, received ${counts[group] ?? 0}`);
  }

  validateCardCoverage(syllabus, cards);
  return true;
}

export function createValidatedCards(syllabus = GRADE_7_SYLLABUS) {
  const cards = generateCards(syllabus);
  validateCards(cards, syllabus);
  return Object.freeze(cards);
}

export const GRADE_7_CARDS = createValidatedCards();
