# Structure — the language

This is the document the CSS used to be. Every rule below is stated with the
reason it exists, because a rule without a reason gets broken by the first
person in a hurry — and rightly so.

Every value here was **measured off the live kwapso.com**, not invented. Where
something is derived, it says so and shows the arithmetic.

---

## 1 · The four decisions

Everything else follows from these.

### It is flat

kwapso.com uses **zero box-shadows** across a 5,142-pixel page. Not subtle
ones — none. Depth is expressed entirely by surface colour and space.

A card is sand (`#f7f2eb`) on paper (`#fffdf8`). That colour step *is* the
elevation. There is no second mechanism.

> **The rule.** No shadows. The only exception is a surface genuinely detached
> from the page — a modal, a drawer, a popover, a toast — which may use
> `--st-elevation-escape-hatch`. Every use is counted by the linter.

Flatness is the fastest thing to lose and the hardest to get back. A designer
adds one card shadow "for hierarchy", a second follows within a week, and the
system now looks like every other Tailwind template.

### One accent, held back

Mango (`#ffd066`) appears on eleven filled elements across that entire page.
Everything else is ink on paper.

> **The rule.** Mango means *"this is the next action."* One filled accent per
> view. If a screen has two, one of them is lying.

This is the rule people most want to break and it is the one that matters most.
An accent used twice is a colour. Used once, it is an instruction.

Mango is **never** a gradient, **never** body text, and **never** a link colour
— colouring links mango would spend the accent budget on prose.

### Two faces, two weights

- **Serrif Condensed**, weight 300 — display only. Hero lines, section
  statements, pull quotes, stat figures.
- **Saans**, weights 300 and 500 — everything else.

There is **no bold**. 500 is the system's only emphasis.

The display face is set at **0.8 line-height** — negative leading, where the
line box is smaller than the type. A 108px headline sits on 86.4px lines. This
is the single most recognisable thing about the brand's typography, and it is
the first thing lost when someone re-types a headline into a default component.

### Tracking opens, not tightens

Headings and labels carry **+0.5px**. Measured, on 79 elements.

Nearly every design system of the last decade tightens heading tracking
(`-0.02em` and friends). This one opens it. The effect is that headings read as
*calm and deliberate* rather than *urgent and condensed* — which is the entire
brand position: a company that makes chaotic operations orderly.

Display type is the exception: it sets at normal tracking, because at 108px the
letterforms already have all the room they need.

---

## 2 · Colour

| Token | Value | What it is for |
|---|---|---|
| `ink` | `#191817` | All text, all icons, all borders. A **warm** near-black — never `#000`. |
| `paper` | `#fffdf8` | The page. Solid: no gradients, no patterns, no ambient glow. |
| `sand` | `#f7f2eb` | The second surface. Cards, rows, wells. |
| `mango` | `#ffd066` | The accent. One per view. |
| `sky` | `#89bce5` | Informational mark. |
| `forest` | `#1d9159` | Success. |
| `poppy` | `#ea4832` | Destructive. |
| `grey` | `#bab8b4` | Disabled. |

**Marks are never surfaces.** Sky, forest and poppy exist as small objects —
a status dot, a chart series, a chip, a left rule on an alert. None of them is
ever a section background. Ink and paper carry every screen; a coloured panel
would compete with the accent for the eye.

### The ink ramp, and which rung to use

Translucent ink is used for everything between text and page. The rung matters,
because two of them are load-bearing for accessibility:

| Token | Use | Contrast on paper |
|---|---|---|
| `ink-10` | Decorative dividers | 1.23:1 — exempt, a rule is not a control |
| `ink-15` | Card outlines | 1.36:1 — exempt, the surface already carries the edge |
| `ink-30` | Disabled glyphs | 1.95:1 |
| `ink-50` | **Control borders and focus rings** | **3.35:1** — clears WCAG 1.4.11 |
| `ink-65` | **Muted text** | **5.46:1** — clears WCAG AA |

The rule that matters: **if a border is the only thing telling a user where a
control is, it must be `ink-50` or stronger.** A form field outlined at `ink-15`
is invisible, and that is a real failure, not a stylistic one.

### Where the palette bends for accessibility

Two derived values exist because the brand colour alone does not carry meaning
safely. Both follow the same principle: **the brand value stays for decoration
and charts; a deepened variant takes the semantic role.**

- **`sky-deep` (`#6489a7`)** is the *informational* colour. Brand sky measures
  1.99:1 on paper — invisible as a status mark. Deepened along its own hue to
  3.63:1.
- **`mango-deep` (`#e8b244`)** is hover, pressed, and the *warning* role. It is
  not a second accent.

### The stroke rule

Mango is 1.43:1 on paper and sky is 1.99:1. As bare chart fills they are not
identifiable — which is exactly the flaw visible in the live scorecard's radar
charts today.

> **The rule.** Every chart mark carries a 1px `--st-chart-stroke` outline. The
> boundary, not the fill, makes the mark findable.

This keeps the brand palette intact instead of darkening it into something
off-brand.

### Colour never carries meaning alone

Every status colour is paired with a word or a shape. The `StatusDot` component
takes a mandatory `label` prop and always renders it — there is deliberately no
way to render a bare coloured dot.

---

## 3 · Type

| Step | Size | Leading | Use |
|---|---|---|---|
| `4xl` | 108px | **0.8** | Hero. Serif, 300. |
| `3xl` | 76.3px | 1.05 | Display, secondary. |
| `2xl` | 46.8px | 1.0 | H2 / section headings. |
| `xl` | 28.8px | 1.2 | H3 / card titles. |
| `lg` | 20px | 1.5 | Large lead. |
| `md` | 18px | 1.5 | Lead paragraph. |
| `base` | 16px | 1.5 | Body at app density. |
| `sm` | **14.4px** | 1.5 | **Body default.** |
| `xs` | 12px | 1.5 | Meta, timestamps. |
| `2xs` | 10.8px | 1.1 | Legal. Sparingly. |

Body is **14.4px** — 0.9rem. On kwapso.com it outnumbers every other size by
roughly ten to one. In `compact` density it moves to 16px, because a dense
screen someone works in all day needs the extra size that an airy marketing
page does not.

**Maximum three type sizes per view.** Enforced. Every size added is another
thing the eye has to rank.

### Fonts are not shipped

Saans and Serrif Condensed are licensed typefaces. This repository has **no
right to redistribute them** and therefore ships none. Self-host them in the
consuming app and override two variables:

```css
:root {
  --st-font-sans: "Saans", system-ui, sans-serif;
  --st-font-display: "Serrif Condensed", Georgia, serif;
}
```

Without them, the open fallback stack keeps the proportions and the feel.

---

## 4 · Space, curves, motion

**Space.** Base 20. The whole rhythm is `10 / 20 / 40 / 60 / 80 / 100 / 150`.
Sections breathe at 100 or 150; content stacks at 20.

**Curves.** Three, and nothing in between:

- `10px` — every rectangular surface
- `50px` — pills: buttons, chips, badges
- `50%` — circles: avatars, dots, the FAB

An in-between radius is the fastest way to make a system look generated rather
than designed. The scale converges deliberately: there is no `6px`, no `16px`.

**Motion.** One easing, `cubic-bezier(0.645, 0.045, 0.355, 1)`. One duration,
200ms. Nothing exceeds 400ms.

> **The rule.** Motion is functional only. It confirms an action or reveals a
> relationship. It never decorates.

There is exactly one entrance animation (`.st-reveal`) and three continuous
indicators (spinner, typing dots, streaming caret) — each of which communicates
live state rather than decorating. `prefers-reduced-motion` is honoured
unconditionally, which costs nothing precisely because no motion here is load-
bearing.

---

## 5 · Density

One token set, two rhythms — switched with a single attribute:

```html
<div data-density="compact">…</div>
```

| | `comfortable` | `compact` |
|---|---|---|
| Body | 14.4px | 16px |
| Section | 100px | 40px |
| Stack gap | 20px | 10px |
| Control | 44px | 36px |

**Comfortable** is for marketing, editorial and onboarding — pages that need
air to feel considered. **Compact** is for dashboards, tables, settings and
chat — anything someone works in all day, where proximity makes a scan one
movement instead of ten.

This is a cognitive-load control, not a style. See
[COGNITIVE-LOAD.md](COGNITIVE-LOAD.md).

---

## 6 · Dark

kwapso.com has no dark mode. What ships here is an **inversion, not an
invention**: ink is already a defined brand surface, so ink becomes the page
and paper becomes the text.

Mango does not shift between themes — the accent must read identically in both,
or it stops being a single recognisable signal. Success and danger are lifted
slightly, because `#1d9159` on `#191817` does not clear the non-text floor.

---

## 7 · What this language will not do

Stated plainly, because a design language is defined as much by its refusals:

- **No gradients.** Anywhere. Backgrounds are solid.
- **No glass, blur, or translucent panels.**
- **No shadows** outside detached overlays.
- **No coloured borders** other than the 2px mango outline on a secondary button.
- **No second accent.**
- **No bold weight.**
- **No decorative motion**, no ambient background, no drifting glow.
- **No emoji in product UI.** Real iconography, or nothing.
- **No horizontal page scroll.** Only designated, contained scrollers.
- **No in-between radius.**

---

## 8 · Accessibility is part of the language

Not a compliance exercise bolted on afterwards.

- Every text and non-text pairing is verified by `npm run check:contrast` — 30
  pairings, both surfaces, both themes, failing the build on a regression.
- Where a pairing sits below the floor deliberately, the exemption is **printed
  with its reason on every run**, so it must be re-justified rather than
  quietly inherited.
- 44px is the minimum touch target — which is both the brand's measured control
  height and the WCAG 2.5.5 floor. The brand and the standard agree, so there is
  no tension to resolve.
- Focus is never removed and never mango: a focus ring is not an accent, and a
  mango ring on a mango button would be invisible.
- Colour never carries meaning alone.

---

*Values measured from kwapso.com on 17 August 2026. When the site changes,
re-measure and update `tokens/tokens.json` — this document describes the
system, but that file is the system.*
