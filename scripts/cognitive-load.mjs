#!/usr/bin/env node
/**
 * The cognitive-load linter.
 *
 * A design system that only ships taste gets ignored the first time someone
 * is in a hurry. This counts the things that actually make an interface hard
 * to read, and fails the build when a view goes over budget.
 *
 *   node scripts/cognitive-load.mjs <files or dirs...>
 *   node scripts/cognitive-load.mjs --self       # lint this repo
 *   node scripts/cognitive-load.mjs --json       # machine-readable output
 *
 * Budgets live in tokens/tokens.json under "cognitive", so they are versioned
 * and arguable in a pull request rather than buried in a script.
 *
 * TWO KINDS OF FILE
 * -----------------
 * Budget rules apply to a VIEW — a page, a screen, a component someone will
 * actually look at. They do not apply to a DEFINITION file, which is supposed
 * to declare the whole vocabulary: css/components.css defines every accent
 * variant and every type size on purpose, and counting those as overuse would
 * be a category error. Mark a definition file with `structure-definitions`
 * in a comment; this repo's own css/ is marked that way.
 *
 * Hygiene rules (hardcoded colours, hand-rolled shadows, tiny touch targets)
 * apply everywhere, because those are wrong in a definition file too.
 *
 * Every rule can be suppressed inline, with a reason — a rule you cannot
 * override is a rule people route around entirely:
 *
 *   <!-- structure-ignore accent-budget: pricing compares two plans -->
 */
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join, relative, extname } from "node:path"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const T = JSON.parse(readFileSync(join(root, "tokens/tokens.json"), "utf8"))
const B = T.cognitive

const argv = process.argv.slice(2)
const SELF = argv.includes("--self")
const JSON_OUT = argv.includes("--json")
const EXTS = new Set([".html", ".htm", ".jsx", ".tsx", ".vue", ".svelte", ".astro", ".css"])

const walk = (p, out = []) => {
  if (!existsSync(p)) return out
  if (statSync(p).isFile()) { if (EXTS.has(extname(p))) out.push(p); return out }
  for (const e of readdirSync(p)) {
    if (["node_modules", ".git", "dist"].includes(e)) continue
    walk(join(p, e), out)
  }
  return out
}

const targets = SELF
  ? [...walk(join(root, "css")), ...walk(join(root, "docs")), ...walk(join(root, "react"))]
  : argv.filter((a) => !a.startsWith("--")).flatMap((a) => walk(a))

if (!targets.length) {
  console.error("Nothing to lint. Pass files or directories, or --self.")
  process.exit(2)
}

/* --------------------------------------------------------------- parsing */

/**
 * Replace comment bodies with equivalent-length blanks. Offsets — and so all
 * reported line numbers — stay exact, while prose inside a comment can no
 * longer trip a rule. (The contrast rationale in components.css quotes real
 * hex values; without this, the linter flags its own documentation.)
 */
const blankComments = (src) => {
  const blank = (m) => m.replace(/[^\n]/g, " ")
  return src
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + blank(m.slice(p.length)))
}

/** Regions where literal colours are legitimate: print has no theme. */
const printRanges = (src) => {
  const out = []
  for (const m of src.matchAll(/@media\s+print[^{]*\{/g)) {
    let i = m.index + m[0].length, depth = 1
    while (i < src.length && depth > 0) {
      if (src[i] === "{") depth++
      else if (src[i] === "}") depth--
      i++
    }
    out.push([m.index, i])
  }
  return out
}

/** The CSS rule block containing an offset, so context checks are real. */
const blockAt = (src, idx) => {
  const start = src.lastIndexOf("}", idx) + 1
  const end = src.indexOf("}", idx)
  return src.slice(start, end === -1 ? src.length : end)
}

const lineOf = (src, idx) => src.slice(0, idx).split("\n").length

/* ----------------------------------------------------------------- rules */

const findings = []
const add = (file, line, rule, msg) => findings.push({ file, line, rule, msg })

/** Continuous state indicators. Not transitions — exempt from the ceiling. */
const CONTINUOUS = /spin|pulse|typing|caret|reveal|skeleton|shimmer/i

const RULES = [
  {
    id: "accent-budget",
    scope: "view",
    why: "Mango means 'this is the next action'. A second one on the same view makes both of them mean 'something'. Restraint is what makes the accent work at all.",
    run(src, file) {
      const hits = [...src.matchAll(/st-btn--accent|st-card--accent|st-badge--accent/g)]
      if (hits.length > B["max-accents-per-view"]) {
        add(file, lineOf(src, hits[B["max-accents-per-view"]].index), this.id,
          `${hits.length} filled accents in one view (budget ${B["max-accents-per-view"]})`)
      }
    },
  },
  {
    id: "type-scale",
    scope: "view",
    why: "Every additional type size is another thing the eye must rank. Three is enough to express heading, body and meta; a fourth is almost always an unconsidered default.",
    run(src, file) {
      const sizes = new Set([...src.matchAll(/st-text-([\w-]+)/g)].map((m) => m[1]))
      if (sizes.size > B["max-type-sizes-per-view"]) {
        add(file, 1, this.id,
          `${sizes.size} type sizes (budget ${B["max-type-sizes-per-view"]}): ${[...sizes].join(", ")}`)
      }
    },
  },
  {
    id: "flatness",
    scope: "all",
    why: "kwapso.com uses zero box-shadows across its entire length. Depth comes from surface colour and space. A shadow outside an overlay is the fastest way to stop looking like Kwapso.",
    run(src, file, { isDefinition }) {
      // Capture the VALUE and test it. A lookahead after `\s*` backtracks to a
      // zero-width match and silently passes everything.
      for (const m of src.matchAll(/box-shadow\s*:\s*([^;{}]+)/g)) {
        const value = m[1].trim()
        if (/^none$/i.test(value) || value.includes("--st-elevation")) continue
        // An inset hairline is a border drawn with a shadow, not elevation.
        if (/^inset\b/.test(value)) continue
        add(file, lineOf(src, m.index), this.id,
          `Hand-rolled shadow \`${value.slice(0, 42)}\` — use var(--st-elevation-escape-hatch), on an overlay only`)
      }
      if (isDefinition) return
      const optouts = (src.match(/--st-elevation-escape-hatch|shadow-overlay/g) ?? []).length
      if (optouts > B["max-shadow-optouts-per-view"]) {
        add(file, 1, this.id,
          `${optouts} elevation opt-outs (budget ${B["max-shadow-optouts-per-view"]}). Only detached overlays qualify.`)
      }
    },
  },
  {
    id: "motion-budget",
    scope: "all",
    why: "Motion above 400ms stops reading as feedback and starts reading as a wait. Continuous indicators (spinner, typing, skeleton) are exempt — they communicate live state rather than transitioning between two.",
    run(src, file) {
      for (const m of src.matchAll(/(\d+(?:\.\d+)?)(ms|s)\b/g)) {
        const ms = m[2] === "s" ? parseFloat(m[1]) * 1000 : parseFloat(m[1])
        if (ms <= B["max-motion-duration-ms"]) continue
        const block = blockAt(src, m.index)
        if (CONTINUOUS.test(block) || CONTINUOUS.test(src.slice(Math.max(0, m.index - 60), m.index))) continue
        add(file, lineOf(src, m.index), this.id,
          `${m[0]} exceeds the ${B["max-motion-duration-ms"]}ms ceiling`)
      }
    },
  },
  {
    id: "touch-target",
    scope: "all",
    why: "44px is both the brand's measured control height and the WCAG 2.5.5 floor. Below it, a control is a coin toss on a phone.",
    run(src, file) {
      for (const m of src.matchAll(/min-height\s*:\s*(\d+)px/g)) {
        const px = +m[1]
        if (px >= B["min-touch-target-px"]) continue
        const block = blockAt(src, m.index)
        const interactive = /btn|input|composer|tabs__tab|menu__item|choice|scale__item|prompts__item|toolcall__head|sidebar__link/.test(block)
        // Small variants and non-pointer marks opt out by construction.
        if (!interactive || /--sm|switch|chip__remove|avatar|dot|spinner|badge/.test(block)) continue
        add(file, lineOf(src, m.index), this.id,
          `Interactive element at ${px}px is under the ${B["min-touch-target-px"]}px floor`)
      }
    },
  },
  {
    id: "hardcoded-value",
    scope: "all",
    why: "A literal colour cannot be re-themed, cannot be dark-moded, and will not move when the token moves. This is the rule that keeps a reskin to a single file.",
    run(src, file) {
      if (/tokens\.css$/.test(file)) return
      const print = printRanges(src)
      for (const m of src.matchAll(/#[0-9a-fA-F]{3,8}\b|\brgba?\([\d\s.,%/]+\)/g)) {
        if (print.some(([a, b]) => m.index >= a && m.index < b)) continue
        const block = blockAt(src, m.index)
        // Scrims are intentionally literal: a translucent ink wash has no token.
        if (/st-overlay/.test(block)) continue
        add(file, lineOf(src, m.index), this.id, `Literal colour ${m[0]} — use a token`)
      }
    },
  },
  {
    id: "grouping",
    scope: "view",
    why: "Working memory holds about seven items. Past that a list stops being scanned and starts being searched, which is a different and much slower task.",
    run(src, file) {
      // Count siblings inside each <nav> / [role=navigation] container.
      for (const m of src.matchAll(/<nav\b[\s\S]*?<\/nav>/g)) {
        const n = (m[0].match(/<a\b/g) ?? []).length
        if (n > B["max-items-per-group"]) {
          add(file, lineOf(src, m.index), this.id,
            `${n} links in one <nav> (budget ${B["max-items-per-group"]}) — group them or promote a level`)
        }
      }
    },
  },
  {
    id: "colour-only-meaning",
    scope: "view",
    why: "Colour alone is invisible to roughly one in twelve men, and to anyone on a bad screen in bright sun. Every status needs a word or a shape too.",
    run(src, file) {
      for (const m of src.matchAll(/class="[^"]*st-dot--(?:success|danger|warning|info)[^"]*"([\s\S]{0,200})/g)) {
        const after = m[1]
        if (/aria-label|sr-only|>[^<]*[A-Za-z]{3}/.test(after)) continue
        add(file, lineOf(src, m.index), this.id,
          "Status dot with no adjacent text label or aria-label")
      }
    },
  },
]

/* --------------------------------------------------------------- execute */

let viewCount = 0
for (const file of targets) {
  const raw = readFileSync(file, "utf8")

  // Generated artifacts are not authored code. Linting them reports the same
  // finding twice — once in the source, once in the build output — and the
  // second copy is not actionable, since editing it would be overwritten.
  if (/GENERATED FILE\. Do not edit by hand/.test(raw)) continue

  // Suppressions and the definition marker are read from the RAW text,
  // because both live inside comments that are about to be blanked out.
  const isDefinition = /structure-definitions/.test(raw)
  const src = blankComments(raw)
  const rel = relative(process.cwd(), file)
  if (!isDefinition) viewCount++

  for (const rule of RULES) {
    if (new RegExp(`structure-ignore\\s+${rule.id}\\b`).test(raw)) continue
    if (rule.scope === "view" && isDefinition) continue
    rule.run.call(rule, src, rel, { isDefinition })
  }
}

/* ---------------------------------------------------------------- report */

if (JSON_OUT) {
  console.log(JSON.stringify({ files: targets.length, views: viewCount, findings }, null, 2))
  process.exit(findings.length ? 1 : 0)
}

const byRule = findings.reduce((m, f) => ((m[f.rule] ??= []).push(f), m), {})
const wrap = (s) => s.replace(/(.{86}) /g, "$1\n       ")

console.log(`Cognitive-load report — ${targets.length} file(s), ${viewCount} view(s)\n`)

if (!findings.length) {
  console.log("  Within budget on every rule.\n")
  for (const r of RULES) console.log(`  ok  ${r.id}`)
  process.exit(0)
}

for (const [rule, items] of Object.entries(byRule)) {
  const def = RULES.find((r) => r.id === rule)
  console.log(`${rule}  (${items.length})`)
  console.log(`  why: ${wrap(def.why)}`)
  for (const f of items.slice(0, 12)) console.log(`    ${f.file}:${f.line}  ${f.msg}`)
  if (items.length > 12) console.log(`    ... and ${items.length - 12} more`)
  console.log("")
}

console.log(`${findings.length} finding(s).`)
console.log(`Suppress inline with:  structure-ignore <rule>: <reason>`)
process.exit(1)
