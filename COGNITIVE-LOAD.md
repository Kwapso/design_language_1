# Cognitive load

Most design systems ship taste. Taste loses to a deadline. This one ships
**budgets the build checks**, so the easy path and the considered path are the
same path.

```bash
node scripts/cognitive-load.mjs src/          # your views
node scripts/cognitive-load.mjs --self        # this repo
node scripts/cognitive-load.mjs --json src/   # for CI dashboards
```

Budgets live in `tokens/tokens.json` under `cognitive`, so they are versioned
and arguable in a pull request rather than buried in a script.

---

## The premise

Cognitive load is not "how pretty is this". It is **how much work the interface
makes someone do that is not the task they came to do**. Ranking three type
sizes is work. Deciding which of two yellow buttons is the real one is work.
Re-finding your place after an animation is work.

None of that shows up in a design review, because a reviewer looks at one
screen for thirty seconds while fresh. It shows up on the fortieth screen of
someone's Tuesday.

So it gets counted.

---

## The rules

### `accent-budget` — 1 filled accent per view

Mango means *"this is the next action."* A second one on the same view makes
both mean *"something."*

The moment a view has two primary buttons, the user has to read both, compare
them, and decide — which is precisely the work a primary action is supposed to
remove. Outline and ghost buttons are unlimited: they are secondary by
construction and cost nothing to ignore.

### `type-scale` — 3 sizes per view

Every size is a rung on a hierarchy the reader has to reconstruct. Three is
enough to say *heading*, *body*, *meta*. A fourth is almost always an
unconsidered default rather than a decision.

### `grouping` — 7 items per group

Working memory holds roughly seven items. Past that, a list stops being
*scanned* and starts being *searched* — a different and much slower task.

The `Navbar` component warns in development when it exceeds this, because a
nine-item nav is a design smell, not a runtime error, and it must never cost
anything in production.

### `flatness` — 2 elevation opt-outs per view

The system is flat. Hierarchy comes from surface colour and space. Only a
genuinely detached surface — modal, drawer, popover, toast — may cast a shadow,
and each use is counted.

A hand-rolled `box-shadow` is always a finding, in every file, including
definition files.

### `motion-budget` — 400ms

Past this, motion stops reading as feedback and starts reading as a wait.

Continuous indicators — spinner, typing dots, streaming caret, skeleton — are
exempt, because they communicate live state rather than transitioning between
two states.

### `touch-target` — 44px

Both the brand's measured control height and the WCAG 2.5.5 floor. Below it, a
control is a coin toss on a phone. Compact density lowers the visual height to
36px but never the hit area.

### `hardcoded-value` — 0

A literal colour cannot be re-themed, cannot be dark-moded, and will not move
when the token moves. This is the single rule that keeps a reskin to one file
instead of a thousand.

Exempt: `@media print` (print has no theme) and overlay scrims (a translucent
ink wash has no token).

### `colour-only-meaning` — 0

Colour alone is invisible to roughly one man in twelve, and to anyone on a bad
screen in bright sunlight. Every status needs a word or a shape as well.

---

## Beyond the counters

Three principles the linter cannot check, which matter as much:

### Progressive disclosure is the default, not an option

Machine detail — tool calls, reasoning traces, raw payloads, advanced settings
— starts collapsed. `Reveal`, `Accordion` and `ToolCall` are built on
`<details>`, so they work without JavaScript and stay findable by in-page
browser search.

The test: **can someone complete the main task without expanding anything?** If
not, something is collapsed that should not be.

### The default answer is the right answer

Every choice presented is work. A form with sensible defaults that a user skips
entirely is better than a form with a well-designed empty state. Prefer
inferring over asking, and asking over configuring.

### One question at a time beats one long form

The scorecard's thirty questions work because they arrive one at a time. The
same thirty in a single scroll would be abandoned. `Stepper` and `Scale` exist
to make the one-at-a-time shape the easy one to build.

---

## Suppressing a rule

A rule you cannot override is a rule people route around entirely — by turning
the linter off. So every rule can be suppressed inline, **with a reason**:

```html
<!-- structure-ignore accent-budget: pricing deliberately compares two plans -->
```

```css
/* structure-ignore flatness: print stylesheet, no theme applies */
```

The reason is the point. A suppression with a good reason is a design decision
on the record; one without is a smell visible in review.

---

## What a clean run looks like

```
Cognitive-load report — 14 file(s), 12 view(s)

  Within budget on every rule.

  ok  accent-budget
  ok  type-scale
  ok  flatness
  ok  motion-budget
  ok  touch-target
  ok  hardcoded-value
  ok  grouping
  ok  colour-only-meaning
```

## Views versus definitions

Budget rules apply to a **view** — a page, a screen, something someone looks
at. They do not apply to a **definition file**, which is *supposed* to declare
the whole vocabulary: `css/components.css` defines every accent variant and
every type size on purpose, and counting those as overuse would be a category
error.

Mark a definition file with `structure-definitions` in a comment. Hygiene rules
still apply there — a hardcoded colour is wrong in a definition file too.
