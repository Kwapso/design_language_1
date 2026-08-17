# Structure

**The Kwapso design language.** Tokens, a framework-free reskin layer,
components for apps / websites / interfaces / chat, and a cognitive-load budget
the build actually enforces.

Every value was **measured off the live [kwapso.com](https://kwapso.com)** — not
invented, not approximated. Where a value is derived, the repo shows the
arithmetic.

📖 **[Documentation & live components →](https://kwapso.github.io/design_language_1/)**

---

## The four decisions

|  |  |
|---|---|
| **It is flat** | kwapso.com uses **zero box-shadows** across a 5,142px page. Depth is surface colour and space. Only detached overlays may opt out. |
| **One accent** | Mango `#ffd066` means *"this is the next action."* One filled accent per view — the linter counts them. |
| **Two faces, two weights** | A condensed serif at **0.8 line-height** for statements; a grotesk at 300 and 500 for everything else. There is no bold. |
| **Tracking opens** | Headings carry **+0.5px**. The opposite of the tight-tracking default — it is why the brand reads calm rather than urgent. |

Read the whole thing: **[LANGUAGE.md](LANGUAGE.md)**

---

## Install

```bash
npm install github:Kwapso/design_language_1
```

Or take the single file with no build step at all:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Kwapso/design_language_1@main/dist/structure.bundle.css">
```

## Use it

**Reskin an existing app.** Semantic HTML is styled for you — no markup
changes, no framework:

```html
<link rel="stylesheet" href="structure.css">
<body data-density="comfortable">   <!-- or "compact" for app screens -->
```

**Tokens only**, mapped onto components you already have:

```css
@import "@kwapso/structure/tokens.css";
.my-button { background: var(--st-accent); border-radius: var(--st-radius-pill); }
```

**Tailwind:**

```js
module.exports = { presets: [require("@kwapso/structure/tailwind")] }
```

**React:**

```tsx
import { ThemeProvider, Button, Card, Chat } from "@kwapso/structure/react"
import "@kwapso/structure/structure.css"
```

Full instructions, including Next.js and Webflow: **[ADOPTION.md](ADOPTION.md)**

---

## What is in here

```
tokens/tokens.json        the system — one file, the source of truth
dist/                     generated: CSS vars, SCSS, typed JS, Tailwind preset, Figma tokens
css/base.css              the reskin — plain semantic HTML speaks Structure
css/components.css        ~70 framework-free component classes
react/                    React wrappers that render exactly those class names
docs/                     the documentation site (rendered by the shipped bundle)
scripts/check-contrast    30 WCAG pairings, both themes, fails the build
scripts/cognitive-load    the budgets, enforced
```

Nothing hardcodes a colour. Change `tokens.json`, run `npm run build`, and
every surface moves — including the website and any app that installed it.

---

## The cognitive-load layer

Most design systems ship taste. Taste loses to a deadline.

```bash
npx structure-lint src/
```

| Rule | Budget | Why |
|---|---|---|
| `accent-budget` | 1 | A second mango makes both mean "something". |
| `type-scale` | 3 | Every size added is another thing the eye must rank. |
| `grouping` | 7 | Past seven, a list stops being scanned and starts being searched. |
| `flatness` | 2 | Only detached overlays may cast a shadow. |
| `motion-budget` | 400ms | Beyond this, motion reads as a wait, not feedback. |
| `touch-target` | 44px | The brand's control height and the WCAG floor agree. |
| `hardcoded-value` | 0 | A literal colour cannot be re-themed or dark-moded. |
| `colour-only-meaning` | 0 | Colour alone is invisible to about one man in twelve. |

Budgets live in `tokens.json`, so they are versioned and arguable in a pull
request. Every rule can be suppressed inline **with a reason** — a rule you
cannot override is a rule people route around entirely.

**[COGNITIVE-LOAD.md](COGNITIVE-LOAD.md)**

---

## Accessibility is verified, not claimed

`npm run check:contrast` tests 30 text and non-text pairings against WCAG 2.1
across both surfaces and both themes, and fails the build on a regression.

Where a pairing sits below the floor deliberately — mango is a pale yellow and
always will be — the exemption is **printed with its reason on every run**, so
it has to be re-justified rather than quietly inherited.

Two palette values exist purely to make meaning safe: `sky-deep` for the
informational role (brand sky is 1.99:1 on paper — invisible as a status mark)
and the **stroke rule**, which gives every chart mark a 1px outline so the
boundary carries what a pale fill cannot.

---

## Fonts are not included

Saans and Serrif Condensed are **licensed typefaces**. This repository ships no
font files, because a public MIT repo has no right to redistribute them.
Self-host them in your app and the language picks them up automatically; without
them you get an open fallback stack that keeps the proportions and the feel.

See [ADOPTION.md](ADOPTION.md) and the note in [LICENSE](LICENSE).

---

## Develop

```bash
npm install
npm run build      # regenerate every output from tokens.json
npm run check      # build + contrast + cognitive load + typecheck
npm run docs       # serve the documentation site locally
```

MIT. Values measured from kwapso.com on 17 August 2026.
