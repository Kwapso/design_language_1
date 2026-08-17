# Contributing

## The one rule

**`tokens/tokens.json` is the system. Everything else is generated from it or
references it.**

No stylesheet, no component, and no app may hardcode a colour, a radius, or a
size. If a value is not in `tokens.json`, it does not exist. The
`hardcoded-value` linter rule enforces this.

## Before you push

```bash
npm run check
```

That runs, in order: build tokens → verify contrast → cognitive-load budgets →
typecheck. All four must pass. CI runs the same command, so a green local run
is a green pipeline.

## Changing a token

1. Edit `tokens/tokens.json`.
2. Run `npm run build` — every output regenerates.
3. Run `npm run check:contrast`. **If a pairing fails, fix the token — never
   lower the threshold.**
4. Document *why* in the token's `use` or `derived` field. A value with a
   reason survives the next redesign; a bare hex does not.

## Adding a component

1. Add the class to `css/components.css`, using tokens only.
2. Add the React wrapper in `react/` that renders **exactly that class name**.
   React must contain no styling logic — one implementation, two front doors.
3. Add a live example to `docs/index.html`.
4. Run `npm run check`.

Prefer a **variant on an existing component** over a new one. `Button` with a
`variant` prop, never `PrimaryButton` + `GhostButton` + `IconButton`.

## Changing a budget

The cognitive-load budgets in `tokens.json` are opinions with reasons, and they
are meant to be argued with. If you change one, change the rationale in
`COGNITIVE-LOAD.md` in the same commit. A budget nobody can explain is a budget
that gets deleted six months later.

## What not to add

Read the "What this language will not do" section of [LANGUAGE.md](LANGUAGE.md)
first. Gradients, glass, shadows outside overlays, a second accent, a bold
weight, and decorative motion are all deliberate exclusions — not gaps.
