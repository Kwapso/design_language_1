#!/usr/bin/env node
/**
 * Verifies every text/surface pairing the language permits against WCAG 2.1.
 * Runs in CI. A failure here is a real accessibility regression, not a warning.
 *
 *   node scripts/check-contrast.mjs
 */
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const T = JSON.parse(readFileSync(join(root, "tokens/tokens.json"), "utf8"))

const hex = (c) => {
  const m = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!m) return null
  const h = m[1].length === 3 ? m[1].split("").map((x) => x + x).join("") : m[1]
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}
const rgba = (c) => {
  const m = c.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)\s*(?:[,/]\s*([\d.]+))?\s*\)/)
  return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null
}
/** Flatten a possibly-translucent colour over an opaque backdrop. */
const solve = (c, bg) => {
  const h = hex(c)
  if (h) return h
  const r = rgba(c)
  if (!r) throw new Error(`Cannot parse colour: ${c}`)
  const [cr, cg, cb, a] = r
  return [cr, cg, cb].map((ch, i) => Math.round(ch * a + bg[i] * (1 - a)))
}
const lum = ([r, g, b]) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const ratio = (fg, bg) => {
  const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x)
  return (a + 0.05) / (b + 0.05)
}

const C = Object.fromEntries(Object.entries(T.color).filter(([k]) => !k.startsWith("$")).map(([k, v]) => [k, v.value ?? v]))
const S = T.semantic

/** [label, foreground, background, minimum required] */
const checks = []
const push = (label, fg, bg, min) => checks.push({ label, fg, bg, min })

for (const [mode, sem] of [["light", S.light], ["dark", S.dark]]) {
  const g = (k) => {
    const v = sem[k]
    const m = typeof v === "string" && v.match(/^\{color\.([^}]+)\}$/)
    return m ? C[m[1]] : v
  }
  const bg = solve(g("background"), [255, 255, 255])
  const surf = solve(g("surface"), bg)

  // --- WCAG 1.4.3: text needs 4.5:1 (normal) / 3:1 (large) -----------------
  push(`${mode}: body on page`, solve(g("foreground"), bg), bg, 4.5)
  push(`${mode}: body on surface`, solve(g("surface-foreground"), surf), surf, 4.5)
  push(`${mode}: muted on page`, solve(g("muted"), bg), bg, 4.5)
  push(`${mode}: muted on surface`, solve(g("muted"), surf), surf, 4.5)
  push(`${mode}: ink on accent (mango button)`, solve(g("accent-foreground"), solve(g("accent"), bg)), solve(g("accent"), bg), 4.5)
  push(`${mode}: ink on accent-hover`, solve(g("accent-foreground"), solve(g("accent-hover"), bg)), solve(g("accent-hover"), bg), 4.5)
  // Placeholders are text. They are exempt from 1.4.3 only when they duplicate
  // a visible label — which this language mandates, so 3:1 is the floor here.
  push(`${mode}: placeholder on surface`, solve(g("placeholder"), surf), surf, 3.0)

  // --- WCAG 1.4.11: things whose BOUNDARY identifies a component ----------
  push(`${mode}: control border on page`, solve(g("border-control"), bg), bg, 3.0)
  push(`${mode}: control border on surface`, solve(g("border-control"), surf), surf, 3.0)
  push(`${mode}: focus ring on page`, solve(g("ring"), bg), bg, 3.0)
  push(`${mode}: focus ring on surface`, solve(g("ring"), surf), surf, 3.0)
  push(`${mode}: chart stroke on page`, solve(g("chart-stroke"), bg), bg, 3.0)

  // Status marks carry meaning by colour, so they must be visible as objects.
  for (const k of ["info", "success", "danger"]) {
    push(`${mode}: ${k} mark on page`, solve(g(k), bg), bg, 3.0)
  }
}

/* --------------------------------------------------------------------------
 * DOCUMENTED EXEMPTIONS — reported, never enforced.
 *
 * These pairings sit below 3:1 and that is a deliberate, defended decision,
 * not an oversight. Each is listed with the reason it does not violate WCAG.
 * They are printed on every run so the exemption stays visible and has to be
 * re-justified rather than quietly inherited.
 * ------------------------------------------------------------------------ */
const paper = hex(C.paper)
const exempt = [
  ["mango fill on paper", C.mango, paper,
    "1.4.11 exempts a component whose boundary is not the only identifier. A mango button always carries an ink label at 12.21:1 and a 44px pill silhouette; the fill is reinforcement, not the signal. Darkening mango to reach 3:1 would change the one colour the brand is recognised by."],
  ["decorative divider on paper", C["ink-10"], paper,
    "A rule between sections is decoration, not a control. 1.4.11 applies to components and states — dividers are neither. Anything that must be identified uses border-control instead."],
  ["card outline on paper", C["ink-15"], paper,
    "A card is identified by its sand surface against the paper page; the hairline is a refinement on top of a contrast that already exists."],
]
for (const [k, v] of Object.entries(T.chart).filter(([k]) => !k.startsWith("$") && !["stroke", "stroke-width"].includes(k))) {
  const m = String(v).match(/^\{color\.([^}]+)\}$/)
  exempt.push([`chart-${k} fill on paper`, m ? C[m[1]] : v, paper,
    "Chart fills are exempt because the stroke rule carries the boundary: every mark is outlined at chart-stroke (checked above, and enforced in css/components.css). The fill distinguishes series; the stroke makes the mark findable."])
}

let failed = 0
const rows = checks.map((c) => {
  const r = ratio(c.fg, c.bg)
  const ok = r >= c.min
  if (!ok) failed++
  return { ...c, r, ok }
})

const w = Math.max(...rows.map((r) => r.label.length))
console.log("ENFORCED — a failure here fails the build\n")
for (const r of rows) {
  console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.label.padEnd(w)}  ${r.r.toFixed(2)}:1  (min ${r.min})`)
}
console.log(`\n  ${rows.length - failed}/${rows.length} enforced pairings pass.`)

console.log("\nEXEMPT — below 3:1 on purpose, with the reason re-stated every run\n")
for (const [label, fg, bg, why] of exempt) {
  console.log(`  ${label} — ${ratio(solve(fg, bg), bg).toFixed(2)}:1`)
  console.log(`      ${why.replace(/(.{92}) /g, "$1\n      ")}`)
}

if (failed) {
  console.error(`\n${failed} contrast failure(s). Fix tokens/tokens.json — do not lower the threshold.`)
  process.exit(1)
}
console.log("\nAll enforced pairings pass.")
