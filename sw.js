const CACHE_NAME = 'trinity-grade-7-scales-v1';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './syllabus.js',
  './scheduler.js',
  './storage.js',
  './practice.js',
  './analytics.js',
  './speech.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
    )).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      if (event.request.mode === 'navigate') return caches.match('./index.html');
      return fetch(event.request);
    }),
  );
});
