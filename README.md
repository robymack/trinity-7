# Trinity Grade 7 Scales

This repository is a lightweight static browser application. It intentionally
uses plain HTML, CSS, and modern JavaScript with no framework, build step, or
runtime dependency.

## Run locally

Serve the repository with a local HTTP server (service workers do not operate
from `file://` URLs):

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open [http://127.0.0.1:4173](http://127.0.0.1:4173). The app stores all
practice history in this browser's local storage.

## Deploy as an installable PWA

Deploy the repository root unchanged to any static host that serves HTTPS. No
build command, server-side route, environment variable, or API key is needed.

For GitHub Pages, push the repository to GitHub, then open **Settings → Pages**
and choose **Deploy from a branch**, selecting the deployment branch and
**/(root)** folder. Once the HTTPS Pages URL is live, visit it once while
online, then use the browser's **Install app** option (or iPhone/iPad Safari's
**Share → Add to Home Screen**). The service worker caches the complete local
application shell for subsequent offline launches.

## Browser tests

The dependency-free test pages are available at:

- `/tests/syllabus.test.html`
- `/tests/scheduler.test.html`
- `/tests/application.test.html`

## Content foundation

`syllabus.js` contains the declarative Grade 7 content, deterministic card
generation, and validation. It generates 122 cards from 17 underlying musical
items.

`syllabus.js` contains the declarative Grade 7 content, deterministic card
generation, and validation. It generates 122 cards from 17 underlying musical
items. The v3 specification confirms the 122-card breakdown against the source
image.
