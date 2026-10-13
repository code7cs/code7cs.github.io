# code7cs.github.io

[View my portfolio →](https://code7cs.github.io/)

Personal engineering portfolio for Hanfan Wang.

The site is a lightweight, dependency-free GitHub Pages project with three primary pages:

- About: positioning, engineering strengths, and selected impact
- Projects: selected engineering work and interactive case studies with clear ownership context
- Resume: an HTML résumé adapted from Hanfan's source résumé without publishing the PDF or phone number

## Momentum CH case study

The reusable case study is available at [`/case-studies/momentum-ch/`](https://code7cs.github.io/case-studies/momentum-ch/). It includes the token pipeline, component examples, dark mode, and adoption story. The page supports normal reading and a presentation mode; illustrative examples are labeled, and the public Momentum source reference is included as a static image.

## Local preview

From the repository root, run:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173/`.

## Checks

Run the built-in Node test suite:

```sh
npm test
```

The checks cover required pages and content, local links, accessibility landmarks, metadata, privacy-sensitive résumé details, and shared responsive assets.

## Publishing

This repository is designed for GitHub Pages at `https://code7cs.github.io/`. GitHub Pages serves the static files directly from the repository's default branch.
