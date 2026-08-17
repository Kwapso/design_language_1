# Adoption

Three doors. Take as much as you want; nothing forces you to the next one.

---

## Door 1 — Reskin an existing app (one line, no build step)

Semantic HTML is styled for you. `<h1>`, `<p>`, `<button>`, `<input>`,
`<table>`, `<details>` already speak Structure. No markup changes, no
framework, no bundler.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Kwapso/design_language_1@main/dist/structure.bundle.css">
```

Or vendor the file: copy `dist/structure.bundle.css` into your app and link it.

**This is the Webflow path too** — paste the `<link>` into Site Settings →
Custom Code → Head.

Then set density on any subtree that is an app rather than a page:

```html
<body data-density="comfortable">        <!-- marketing -->
<main data-density="compact">            <!-- dashboards, tables, chat -->
```

Theme is `data-theme="light" | "dark"`, or omit it entirely to follow the
operating system.

---

## Door 2 — Tokens only

You already have components you like. Take the variables and map them.

```css
@import "@kwapso/structure/tokens.css";

.my-button {
  background: var(--st-accent);
  color: var(--st-accent-foreground);
  border-radius: var(--st-radius-pill);
  min-height: var(--st-control-height);
  transition: background-color var(--st-motion-base) var(--st-motion-ease);
}
```

Also available: `dist/tokens.scss`, `dist/tokens.js` (typed, with literal
types so a typo in a token path is a compile error), and
`dist/tokens.figma.json` in W3C design-token format.

---

## Door 3 — Tailwind, or React

### Tailwind v3

```js
// tailwind.config.js
module.exports = { presets: [require("@kwapso/structure/tailwind")] }
```

### Tailwind v4

v4 reads CSS variables directly — import the tokens and use them:

```css
@import "tailwindcss";
@import "@kwapso/structure/tokens.css";

@theme inline {
  --color-accent: var(--st-accent);
  --color-surface: var(--st-surface);
  --radius-surface: var(--st-radius-surface);
}
```

### React

```bash
npm install github:Kwapso/design_language_1
```

```tsx
import { ThemeProvider, Button, Card, Chat, MessageList, Message, Composer }
  from "@kwapso/structure/react"
import "@kwapso/structure/structure.css"

export default function App() {
  return (
    <ThemeProvider defaultDensity="compact">
      <Card>
        <Button variant="accent">Take the scorecard</Button>
      </Card>
    </ThemeProvider>
  )
}
```

The package ships **TypeScript source**, not compiled JS, so the components
stay readable and your own Tailwind theme applies. In Next.js, `node_modules`
is not transpiled by default — add this or the first import throws a syntax
error:

```ts
// next.config.ts
export default { transpilePackages: ["@kwapso/structure"] }
```

---

## Fonts

**This repository ships no font files.** Saans and Serrif Condensed are
licensed typefaces and redistributing them publicly is not something the
licence permits.

Self-host them in your app, declare them, and the language picks them up:

```css
@font-face { font-family: "Saans"; src: url("/fonts/Saans-Light.woff2") format("woff2");
             font-weight: 300; font-display: swap; }
@font-face { font-family: "Saans"; src: url("/fonts/Saans-Medium.woff2") format("woff2");
             font-weight: 500; font-display: swap; }
@font-face { font-family: "Serrif Condensed"; src: url("/fonts/SerrifCondensed-Light.woff2") format("woff2");
             font-weight: 300; font-display: swap; }
```

No override is needed — those family names are already first in the stack.
Without them you get the open fallback, which keeps the proportions and the
feel but not the brand.

---

## Wire the checks into CI

```yaml
- run: npm run build
- run: npm run check:contrast          # 30 WCAG pairings, fails on regression
- run: npx structure-lint src/         # cognitive-load budgets
```

---

## Updating

npm resolves a GitHub dependency to a **commit SHA** and locks it. A plain
`npm install` will faithfully reinstall the same commit forever — an app can
sit on months-old code while `package.json` looks current. To actually move:

```bash
npm install github:Kwapso/design_language_1
```

Then check what you really have. The lockfile SHA is the truth, not the
version field:

```bash
npm ls @kwapso/structure
```
