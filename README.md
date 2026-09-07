# Trinity Grade 7 Scales

This repository is a lightweight static browser application. It intentionally
uses plain HTML, CSS, and modern JavaScript with no framework, build step, or
runtime dependency.

## Phase 1: syllabus foundation

`syllabus.js` contains the declarative Grade 7 content, deterministic card
generation, and validation. It generates 122 cards from 17 underlying musical
items.

Run the content tests by serving this directory over HTTP, then open:

```text
/tests/syllabus.test.html
```

The browser test page reports every assertion and changes its document title
to `PASS …` or `FAIL …`.

## Source verification required

The original Grade 7 syllabus image is not in this repository. Before release,
verify the transcription in `syllabus.js` against that image. Where the image
and written specification disagree, the image is authoritative; do not infer
additional musical requirements.
