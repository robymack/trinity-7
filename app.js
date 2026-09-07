import { GRADE_7_CARDS } from './syllabus.js';
import { buildAnalytics } from './analytics.js';
import { ensureActivePrompt, scorePrompt } from './practice.js';
import { loadAppState, resetAppState, saveAppState } from './storage.js';
import { speakCard } from './speech.js';

const cardIds = GRADE_7_CARDS.map((card) => card.id);
const cardsById = new Map(GRADE_7_CARDS.map((card) => [card.id, card]));

const elements = {
  practiceTab: document.querySelector('#practice-tab'),
  analyticsTab: document.querySelector('#analytics-tab'),
  practiceView: document.querySelector('#practice-view'),
  analyticsView: document.querySelector('#analytics-view'),
  category: document.querySelector('#card-category'),
  name: document.querySelector('#card-name'),
  conditions: document.querySelector('#card-conditions'),
  details: document.querySelector('#card-details'),
  scoreButtons: [...document.querySelectorAll('[data-score]')],
  status: document.querySelector('#app-status'),
  analyticsContent: document.querySelector('#analytics-content'),
  settingsButton: document.querySelector('#settings-button'),
  settingsDialog: document.querySelector('#settings-dialog'),
  speechEnabled: document.querySelector('#speech-enabled'),
  resetButton: document.querySelector('#reset-button'),
};

let appState;
let isSavingScore = false;

function displayDynamic(dynamic) {
  return {
    f: 'f',
    mf: 'mf',
    p: 'p',
    'crescendo-diminuendo': 'p–f–p',
  }[dynamic] ?? null;
}

function displayHands(hands) {
  return hands === 'contrary-motion' ? 'contrary motion' : `hands ${hands}`;
}

function formatScore(value) {
  return value === null ? '—' : value.toFixed(1);
}

function setStatus(message = '', type = '') {
  elements.status.textContent = message;
  elements.status.dataset.type = type;
}

function renderPractice() {
  const card = cardsById.get(appState.activePromptCardId);
  if (!card) {
    elements.name.textContent = 'Unable to load a practice request.';
    elements.scoreButtons.forEach((button) => { button.disabled = true; });
    return;
  }

  elements.category.textContent = card.category === 'scale' ? 'Scale' : 'Arpeggio';
  elements.name.textContent = card.name;
  const conditions = [displayDynamic(card.dynamic), card.articulation].filter(Boolean);
  elements.conditions.textContent = conditions.join(' · ');

  const details = [`${card.octaves} octaves`, displayHands(card.hands)];
  if (card.motion && card.hands !== 'contrary-motion') details.push(`${card.motion} motion`);
  if (card.recommendedTempoQpm) details.push(`recommended ♩ = ${card.recommendedTempoQpm}`);
  elements.details.textContent = details.join(' · ');
  elements.scoreButtons.forEach((button) => { button.disabled = isSavingScore; });
}

function row(label, value, detail = '') {
  const item = document.createElement('li');
  item.className = 'analytics-row';
  const name = document.createElement('span');
  name.textContent = label;
  const result = document.createElement('span');
  result.className = 'analytics-result';
  result.textContent = `${formatScore(value)}${detail ? `  ${detail}` : ''}`;
  item.append(name, result);
  return item;
}

function analyticsList(title, entries, labelFor) {
  const section = document.createElement('section');
  section.className = 'analytics-section';
  const heading = document.createElement('h3');
  heading.textContent = title;
  const list = document.createElement('ul');
  list.className = 'analytics-list';
  entries.forEach((entry) => list.append(row(labelFor(entry), entry.average, `(${entry.attemptCount})`)));
  section.append(heading, list);
  return section;
}

function renderAnalytics() {
  const analytics = buildAnalytics(GRADE_7_CARDS, appState);
  elements.analyticsContent.replaceChildren();

  const overview = document.createElement('section');
  overview.className = 'analytics-overview';
  const overviewHeading = document.createElement('h2');
  overviewHeading.textContent = 'Your practice';
  const metrics = document.createElement('div');
  metrics.className = 'metrics-grid';
  [
    ['Overall average', formatScore(analytics.overallAverage)],
    ['Total attempts', String(analytics.totalAttempts)],
    ['Cards introduced', `${analytics.introducedCards} / ${GRADE_7_CARDS.length}`],
    ['Cards attempted', `${analytics.attemptedCards} / ${GRADE_7_CARDS.length}`],
  ].forEach(([label, value]) => {
    const metric = document.createElement('div');
    metric.className = 'metric';
    const metricValue = document.createElement('strong');
    metricValue.textContent = value;
    const metricLabel = document.createElement('span');
    metricLabel.textContent = label;
    metric.append(metricValue, metricLabel);
    metrics.append(metric);
  });
  overview.append(overviewHeading, metrics);
  elements.analyticsContent.append(overview);

  elements.analyticsContent.append(
    analyticsList('Musical items · weakest first', analytics.items, (entry) => entry.name),
    analyticsList('Articulation', analytics.articulation, (entry) => entry.name),
    analyticsList('Dynamics', analytics.dynamics, (entry) => entry.name),
  );

  const details = document.createElement('details');
  details.className = 'exact-card-details';
  const summary = document.createElement('summary');
  summary.textContent = 'Exact card performance';
  const list = document.createElement('ul');
  list.className = 'analytics-list';
  analytics.exactCards.forEach((entry) => {
    const conditions = [displayDynamic(entry.dynamic), entry.articulation].filter(Boolean).join(' · ');
    list.append(row(`${entry.name} — ${conditions}`, entry.average, `(${entry.attemptCount})`));
  });
  details.append(summary, list);
  elements.analyticsContent.append(details);
}

function renderView() {
  const showAnalytics = appState.lastScreen === 'analytics';
  elements.practiceView.hidden = showAnalytics;
  elements.analyticsView.hidden = !showAnalytics;
  elements.practiceTab.setAttribute('aria-selected', String(!showAnalytics));
  elements.analyticsTab.setAttribute('aria-selected', String(showAnalytics));
  if (showAnalytics) renderAnalytics();
}

function render() {
  elements.speechEnabled.checked = appState.settings.speechEnabled;
  renderPractice();
  renderView();
}

function speakActivePrompt() {
  if (!appState.settings.speechEnabled) return;
  const card = cardsById.get(appState.activePromptCardId);
  if (!card) return;
  const result = speakCard(card);
  if (!result.spoken) setStatus(result.reason, 'notice');
}

function persist(nextState) {
  saveAppState(window.localStorage, nextState);
  appState = nextState;
}

function selectView(view) {
  const nextState = { ...appState, lastScreen: view };
  try {
    persist(nextState);
    renderView();
  } catch {
    setStatus('This device could not save the selected view.', 'error');
  }
}

function handleScore(score) {
  if (isSavingScore || !appState.activePromptCardId) return;
  isSavingScore = true;
  renderPractice();
  const promptCardId = appState.activePromptCardId;

  try {
    const nextState = scorePrompt(appState, promptCardId, score, Date.now(), Math.random);
    persist(nextState);
    isSavingScore = false;
    setStatus();
    render();
    speakActivePrompt();
  } catch (error) {
    isSavingScore = false;
    setStatus(`Your score was not saved. ${error.message}`, 'error');
    renderPractice();
  }
}

function changeSpeechSetting() {
  try {
    persist({
      ...appState,
      settings: { ...appState.settings, speechEnabled: elements.speechEnabled.checked },
    });
    if (appState.settings.speechEnabled) speakActivePrompt();
  } catch {
    elements.speechEnabled.checked = appState.settings.speechEnabled;
    setStatus('This device could not save the speech setting.', 'error');
  }
}

function resetHistory() {
  if (!window.confirm('Reset all practice scores and history on this device? This cannot be undone.')) return;
  try {
    const freshState = resetAppState(window.localStorage, cardIds, Math.random);
    persist(ensureActivePrompt(freshState, Date.now(), Math.random));
    elements.settingsDialog.close();
    setStatus('Practice history reset.', 'notice');
    render();
    speakActivePrompt();
  } catch (error) {
    setStatus(`History could not be reset. ${error.message}`, 'error');
  }
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // The app remains fully usable in the current browser tab without PWA installation.
    });
  });
}

function initialise() {
  try {
    const loadedState = loadAppState(window.localStorage, cardIds, Math.random);
    const readyState = ensureActivePrompt(loadedState, Date.now(), Math.random);
    persist(readyState);
    render();
    speakActivePrompt();
  } catch (error) {
    setStatus(`This app could not prepare local practice data. ${error.message}`, 'error');
    elements.scoreButtons.forEach((button) => { button.disabled = true; });
  }

  registerServiceWorker();
}

elements.scoreButtons.forEach((button) => {
  button.addEventListener('click', () => handleScore(Number(button.dataset.score)));
});
elements.practiceTab.addEventListener('click', () => selectView('practice'));
elements.analyticsTab.addEventListener('click', () => selectView('analytics'));
elements.settingsButton.addEventListener('click', () => elements.settingsDialog.showModal());
elements.speechEnabled.addEventListener('change', changeSpeechSetting);
elements.resetButton.addEventListener('click', resetHistory);

initialise();
