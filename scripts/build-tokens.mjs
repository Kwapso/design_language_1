#!/usr/bin/env node
/**
 * Compiles tokens/tokens.json into every consumable format.
 *
 * This is the ONLY thing allowed to write into dist/. Nothing downstream —
 * no stylesheet, no component, no app — may hardcode a colour, a radius or a
 * size. If a value is not in tokens.json, it does not exist.
 *
 *   node scripts/build-tokens.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const tokens = JSON.parse(readFileSync(join(root, "tokens/tokens.json"), "utf8"))
const dist = join(root, "dist")
mkdirSync(dist, { recursive: true })

/* ---------------------------------------------------------------- helpers */

/** Resolve a `{color.mango}` style reference against the token tree. */
const deref = (val) => {
  if (typeof val !== "string") return val
  const m = val.match(/^\{([^}]+)\}$/)
  if (!m) return val
  const hit = m[1].split(".").reduce((o, k) => (o == null ? o : o[k]), tokens)
  if (hit == null) throw new Error(`Unresolved token reference: ${val}`)
  return deref(typeof hit === "object" && "value" in hit ? hit.value : hit)
}

/** Token entries may be a bare value or an annotated `{ value, use }` object. */
const valueOf = (v) => deref(v && typeof v === "object" && "value" in v ? v.value : v)

/** Skip the `$comment` / `$name` metadata keys. */
const real = (obj) => Object.entries(obj).filter(([k]) => !k.startsWith("$"))

const banner = (extra = "") => `/* Structure — the Kwapso design language.
 * GENERATED FILE. Do not edit by hand: edit tokens/tokens.json and run
 * \`npm run build:tokens\`. Source of truth measured from https://kwapso.com.
 * ${extra}
 */\n`

/* ------------------------------------------------------------- tokens.css */

const cssVars = (mode) => {
  const out = []
  for (const [k, v] of real(tokens.semantic[mode])) out.push(`  --st-${k}: ${valueOf(v)};`)
  return out.join("\n")
}

let css = banner()
css += `:root {\n`
css += `  /* ---- brand primitives ---- */\n`
for (const [k, v] of real(tokens.color)) css += `  --st-color-${k}: ${valueOf(v)};\n`

css += `\n  /* ---- semantic (light) ---- */\n${cssVars("light")}\n`

css += `\n  /* ---- chart series ---- */\n`
for (const [k, v] of real(tokens.chart)) css += `  --st-chart-${k}: ${valueOf(v)};\n`

css += `\n  /* ---- type ---- */\n`
for (const [k, v] of real(tokens.font)) css += `  --st-font-${k}: ${valueOf(v)};\n`
for (const [k, v] of real(tokens.weight)) css += `  --st-weight-${k}: ${v};\n`
for (const [k, v] of real(tokens.text)) {
  css += `  --st-text-${k}: ${v.size};\n  --st-leading-${k}: ${v.lh};\n`
}
for (const [k, v] of real(tokens.tracking)) css += `  --st-tracking-${k}: ${v};\n`

css += `\n  /* ---- space ---- */\n`
for (const [k, v] of real(tokens.space)) css += `  --st-space-${k}: ${v};\n`

css += `\n  /* ---- form ---- */\n`
for (const [k, v] of real(tokens.radius)) css += `  --st-radius-${k}: ${v};\n`
for (const [k, v] of real(tokens.border)) css += `  --st-border-${k}: ${v};\n`
css += `  --st-elevation-flat: ${tokens.elevation.flat};\n`
css += `  --st-elevation-escape-hatch: ${valueOf(tokens.elevation["escape-hatch"])};\n`

css += `\n  /* ---- motion ---- */\n`
for (const [k, v] of real(tokens.motion)) css += `  --st-motion-${k}: ${v};\n`

css += `\n  /* ---- layout ---- */\n`
for (const [k, v] of real(tokens.layout)) css += `  --st-layout-${k}: ${v};\n`
for (const [k, v] of real(tokens.control)) css += `  --st-control-${k}: ${v};\n`
for (const [k, v] of real(tokens.z)) css += `  --st-z-${k}: ${v};\n`

css += `\n  /* ---- density: comfortable is the default ---- */\n`
for (const [k, v] of real(tokens.density.comfortable)) {
  if (k === "use") continue
  css += `  --st-density-${k}: ${valueOf(v)};\n`
}
css += `}\n\n`

/* Density switch. One attribute changes the rhythm of an entire subtree. */
css += `/* Density is a cognitive-load control, not a style. See COGNITIVE-LOAD.md. */\n`
css += `[data-density="compact"] {\n`
for (const [k, v] of real(tokens.density.compact)) {
  if (k === "use") continue
  css += `  --st-density-${k}: ${valueOf(v)};\n`
}
css += `}\n`
css += `[data-density="comfortable"] {\n`
for (const [k, v] of real(tokens.density.comfortable)) {
  if (k === "use") continue
  css += `  --st-density-${k}: ${valueOf(v)};\n`
}
css += `}\n\n`

/* Dark theme: explicit opt-in AND system preference, so a host page that sets
 * neither still gets a correct light rendering rather than a transparent one. */
css += `/* Dark. Explicit [data-theme] wins over the system preference in both directions. */\n`
css += `[data-theme="dark"] {\n${cssVars("dark")}\n}\n\n`
css += `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n`
css += cssVars("dark").split("\n").map((l) => "  " + l).join("\n")
css += `\n  }\n}\n`

writeFileSync(join(dist, "tokens.css"), css)

/* ------------------------------------------------------------ tokens.scss */

let scss = banner().replace("/*", "//").replace("*/", "").split("\n").map((l) => l.replace(/^ \*/, "//")).join("\n")
const flat = {}
const walk = (obj, path = []) => {
  for (const [k, v] of real(obj)) {
    if (v && typeof v === "object" && !("value" in v)) walk(v, [...path, k])
    else flat[[...path, k].join("-")] = valueOf(v)
  }
}
walk({ color: tokens.color, space: tokens.space, radius: tokens.radius, motion: tokens.motion, layout: tokens.layout })
scss += "\n" + Object.entries(flat).map(([k, v]) => `$st-${k}: ${v};`).join("\n") + "\n"
writeFileSync(join(dist, "tokens.scss"), scss)

/* --------------------------------------------------- tokens.js + .d.ts */

const jsTree = {
  color: Object.fromEntries(real(tokens.color).map(([k, v]) => [k, valueOf(v)])),
  semantic: {
    light: Object.fromEntries(real(tokens.semantic.light).map(([k, v]) => [k, valueOf(v)])),
    dark: Object.fromEntries(real(tokens.semantic.dark).map(([k, v]) => [k, valueOf(v)])),
  },
  chart: Object.fromEntries(real(tokens.chart).map(([k, v]) => [k, valueOf(v)])),
  font: Object.fromEntries(real(tokens.font).map(([k, v]) => [k, valueOf(v)])),
  weight: Object.fromEntries(real(tokens.weight)),
  text: Object.fromEntries(real(tokens.text).map(([k, v]) => [k, { size: v.size, lineHeight: v.lh, px: v.px }])),
  tracking: Object.fromEntries(real(tokens.tracking)),
  space: Object.fromEntries(real(tokens.space)),
  radius: Object.fromEntries(real(tokens.radius)),
  motion: Object.fromEntries(real(tokens.motion)),
  layout: Object.fromEntries(real(tokens.layout)),
  control: Object.fromEntries(real(tokens.control)),
  z: Object.fromEntries(real(tokens.z)),
  cognitive: Object.fromEntries(real(tokens.cognitive)),
}
writeFileSync(
  join(dist, "tokens.js"),
  banner() + `export const tokens = ${JSON.stringify(jsTree, null, 2)}\n\nexport default tokens\n`
)

/* Emit real TypeScript rather than regex-mangled JSON. Literal types mean an
 * editor autocompletes the actual hex, and a typo in a token path is a
 * compile error instead of `undefined` at runtime. */
const tsType = (v, indent = 0) => {
  const pad = "  ".repeat(indent + 1)
  const close = "  ".repeat(indent)
  if (v === null) return "null"
  if (Array.isArray(v)) return `readonly [${v.map((x) => tsType(x, indent)).join(", ")}]`
  if (typeof v === "object") {
    const body = Object.entries(v)
      .map(([k, val]) => `${pad}readonly ${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${tsType(val, indent + 1)}`)
      .join("\n")
    return `{\n${body}\n${close}}`
  }
  // Literal types: `"#ffd066"` rather than `string`.
  return typeof v === "string" ? JSON.stringify(v) : String(v)
}
writeFileSync(
  join(dist, "tokens.d.ts"),
  banner() + `declare const tokens: ${tsType(jsTree)}\n\nexport { tokens }\nexport default tokens\n`
)

/* ------------------------------------------------- tailwind-preset.js */

const tw = {
  theme: {
    extend: {
      colors: {
        ...Object.fromEntries(real(tokens.color).map(([k, v]) => [k, valueOf(v)])),
        background: "var(--st-background)",
        foreground: "var(--st-foreground)",
        surface: "var(--st-surface)",
        raised: "var(--st-raised)",
        muted: "var(--st-muted)",
        accent: "var(--st-accent)",
        "accent-foreground": "var(--st-accent-foreground)",
        border: "var(--st-border)",
        divider: "var(--st-divider)",
        ring: "var(--st-ring)",
        info: "var(--st-info)",
        success: "var(--st-success)",
        danger: "var(--st-danger)",
        warning: "var(--st-warning)",
        chart: Object.fromEntries(real(tokens.chart).map(([k, v]) => [k, valueOf(v)])),
      },
      fontFamily: {
        display: valueOf(tokens.font.display).split(",").map((s) => s.trim().replace(/^"|"$/g, "")),
        sans: valueOf(tokens.font.sans).split(",").map((s) => s.trim().replace(/^"|"$/g, "")),
        mono: valueOf(tokens.font.mono).split(",").map((s) => s.trim().replace(/^"|"$/g, "")),
      },
      fontSize: Object.fromEntries(real(tokens.text).map(([k, v]) => [k, [v.size, { lineHeight: String(v.lh) }]])),
      fontWeight: Object.fromEntries(real(tokens.weight).map(([k, v]) => [k, String(v)])),
      letterSpacing: Object.fromEntries(real(tokens.tracking)),
      spacing: Object.fromEntries(real(tokens.space)),
      borderRadius: Object.fromEntries(real(tokens.radius)),
      borderWidth: Object.fromEntries(real(tokens.border)),
      // Flat by design. `shadow-none` is the only shadow most screens may use;
      // `shadow-overlay` exists solely for detached surfaces and is counted by
      // the cognitive-load linter every time it appears.
      boxShadow: { none: tokens.elevation.flat, overlay: valueOf(tokens.elevation["escape-hatch"]) },
      transitionTimingFunction: { st: tokens.motion.ease },
      transitionDuration: {
        fast: tokens.motion.fast,
        base: tokens.motion.base,
        slow: tokens.motion.slow,
      },
      maxWidth: { measure: tokens.layout.measure, frame: tokens.layout.frame },
      zIndex: Object.fromEntries(real(tokens.z).map(([k, v]) => [k, String(v)])),
    },
  },
}
writeFileSync(
  join(dist, "tailwind-preset.js"),
  banner("Usage: `presets: [require('@kwapso/structure/dist/tailwind-preset')]` (v3), or `@import` tokens.css and use the CSS variables directly (v4).") +
    `module.exports = ${JSON.stringify(tw, null, 2)}\n`
)

/* ------------------------------------------------- tokens.figma.json */

const figma = {}
for (const [k, v] of real(tokens.color)) figma[`color/${k}`] = { $type: "color", $value: valueOf(v), $description: v.use ?? "" }
for (const [k, v] of real(tokens.space)) figma[`space/${k}`] = { $type: "dimension", $value: v }
for (const [k, v] of real(tokens.radius)) figma[`radius/${k}`] = { $type: "dimension", $value: v }
for (const [k, v] of real(tokens.text)) figma[`text/${k}`] = { $type: "dimension", $value: v.size, $description: v.use }
writeFileSync(join(dist, "tokens.figma.json"), JSON.stringify(figma, null, 2) + "\n")

/* --------------------------------------------------- structure.bundle.css */

/* One self-contained file: tokens + reskin + components, no @import chain.
 * This is what a CDN link or a Webflow custom-code block wants, and it is
 * what the docs site loads — so the documentation is always rendered by the
 * exact artifact a consumer gets, never by a special-cased copy. */
const bundle =
  banner("SINGLE-FILE BUNDLE: dist/tokens.css + css/base.css + css/components.css, in load order.") +
  [
    readFileSync(join(dist, "tokens.css"), "utf8"),
    readFileSync(join(root, "css/base.css"), "utf8"),
    readFileSync(join(root, "css/components.css"), "utf8"),
  ].join("\n\n")

writeFileSync(join(dist, "structure.bundle.css"), bundle)

/* GitHub Pages publishes docs/ as the site root, so anything the docs page
 * loads has to live inside docs/ — a relative hop up to dist/ resolves off the
 * end of the site and 404s. Copy both artifacts in rather than teaching the
 * page two different paths for local and deployed. */
mkdirSync(join(root, "docs/assets"), { recursive: true })
writeFileSync(join(root, "docs/assets/structure.css"), bundle)
writeFileSync(join(root, "docs/assets/tokens.js"), readFileSync(join(dist, "tokens.js"), "utf8"))

/* ------------------------------------------------------------- report */

const n = (o) => real(o).length
console.log(`Structure tokens built -> dist/
  tokens.css           ${n(tokens.color)} brand + ${n(tokens.semantic.light)} semantic (light & dark) + density modes
  tokens.scss          SCSS variables
  tokens.js / .d.ts    typed JS object
  tailwind-preset.js   Tailwind v3 preset
  tokens.figma.json    W3C design-token format for Figma
  ${n(tokens.text)} type steps · ${n(tokens.space)} space steps · ${n(tokens.radius)} radii · ${n(tokens.motion)} motion tokens`)
