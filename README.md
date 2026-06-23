# Faizan Ali — Portfolio

A fast, single-page developer portfolio with a horizontal "page-slide" layout, a Terminal/Dev visual theme, and a working contact form. Built with plain HTML, CSS, and vanilla JavaScript — no frameworks, no build step.

🔗 **Live:** https://faizan-ali-dev.github.io/My-Portfolio/

## Features

- **Horizontal slide navigation** — wheel, trackpad (vertical *and* horizontal), arrow keys, number keys (1–5), on-screen arrows, and page dots
- **Terminal/Dev theme** — slate palette with a teal/green accent, `Space Grotesk` headings and `JetBrains Mono` accents
- **Animated hero** — typewriter role line that cycles through specialities
- **Responsive** — horizontal slides on desktop, native vertical scroll on mobile
- **Working contact form** via [Web3Forms](https://web3forms.com) with toast notifications
- **Accessible & resilient** — respects `prefers-reduced-motion` and stays usable without JavaScript (`<noscript>` fallback)

## Tech

`HTML5` · `CSS3` (custom properties, grid/flexbox) · `Vanilla JavaScript (ES6 classes)`

## Project structure

```
.
├── index.html            # markup + meta/SEO
├── style.css             # theme + layout (CSS variables in :root)
├── script.js             # navigation, typewriter, form, toasts
├── favicon.svg           # site icon
├── faizan_ali_dev.jpg    # profile photo (optimised)
└── .github/workflows/    # GitHub Pages deploy
```

## Run locally

It's a static site — any static server works:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Customise

- **Contact form:** replace the `access_key` in `index.html` with your own from [web3forms.com](https://web3forms.com).
- **Resume:** drop your CV in the repo root as `Faizan_Ali_CV.pdf` to activate the "Download CV" button.
- **Theme:** edit the colour variables in `:root` at the top of `style.css`.
- **Social / meta URLs:** update the Open Graph URLs in `index.html` if you use a custom domain.

## Deployment

Pushing to `master` auto-deploys to GitHub Pages via the workflow in `.github/workflows/deploy.yml`.

---

© Faizan Ali
