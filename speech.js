const DYNAMIC_SPEECH = {
  f: 'Forte',
  mf: 'Mezzo-forte',
  p: 'Piano',
  'crescendo-diminuendo': 'Crescendo and diminuendo, piano to forte to piano',
};

const LIKELY_FEMALE_BRITISH_VOICE_NAMES = [
  'hazel', 'libby', 'sonia', 'serena', 'kate', 'martha', 'fiona', 'emily',
];

export function buildSpokenInstruction(card) {
  const parts = [card.spokenName];
  if (card.articulation) parts.push(card.articulation[0].toUpperCase() + card.articulation.slice(1));
  if (card.dynamic) parts.push(DYNAMIC_SPEECH[card.dynamic] ?? card.dynamic);
  return parts.join('. ') + '.';
}

export function selectPreferredVoice(voices) {
  if (!Array.isArray(voices) || voices.length === 0) return null;

  const scoreVoice = (voice) => {
    const language = String(voice.lang ?? '').toLowerCase();
    const name = String(voice.name ?? '').toLowerCase();
    let score = 0;
    if (voice.localService === true) score += 40;
    if (language === 'en-gb') score += 60;
    else if (language.startsWith('en-')) score += 20;
    if (LIKELY_FEMALE_BRITISH_VOICE_NAMES.some((fragment) => name.includes(fragment))) score += 15;
    if (voice.default) score += 1;
    return score;
  };

  return [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] ?? null;
}

export function speakCard(card, options = {}) {
  const synth = options.synth ?? globalThis.speechSynthesis;
  const Utterance = options.Utterance ?? globalThis.SpeechSynthesisUtterance;
  if (!synth || !Utterance || typeof synth.speak !== 'function') {
    return { spoken: false, reason: 'Speech is unavailable on this device.' };
  }

  try {
    const utterance = new Utterance(buildSpokenInstruction(card));
    utterance.rate = 0.9;
    utterance.pitch = 1;
    const voice = selectPreferredVoice(typeof synth.getVoices === 'function' ? synth.getVoices() : []);
    if (voice) utterance.voice = voice;
    if (typeof synth.cancel === 'function') synth.cancel();
    synth.speak(utterance);
    return { spoken: true, voiceName: voice?.name ?? null };
  } catch {
    return { spoken: false, reason: 'Speech could not be started.' };
  }
}
