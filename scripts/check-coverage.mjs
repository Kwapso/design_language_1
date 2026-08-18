#!/usr/bin/env node
/**
 * Coverage check — turns "all components are made" into a checked fact.
 *
 * For every item in registry.json it verifies the promised CSS class actually
 * exists in the stylesheets and the promised React symbol is actually exported.
 * A missing implementation fails the build, so the manifest cannot drift into
 * being a wish-list.
 *
 *   node scripts/check-coverage.mjs [--json]
 */
import { readFileSync, readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const reg = JSON.parse(readFileSync(join(root, "registry.json"), "utf8"))

/* Authored stylesheets PLUS the generated one — some classes (.st-invert) are
 * emitted from tokens.json rather than hand-written, and they are no less real. */
const cssSrc = [
  ...readdirSync(join(root, "css")).filter((f) => f.endsWith(".css")).map((f) => join(root, "css", f)),
  join(root, "dist/tokens.css"),
].map((f) => readFileSync(f, "utf8")).join("\n")

const reactFiles = readdirSync(join(root, "react")).filter((f) => /\.tsx?$/.test(f))
const reactSrc = reactFiles.map((f) => readFileSync(join(root, "react", f), "utf8")).join("\n")

/** A class counts as defined only if it appears as an actual selector. */
const cssHas = (cls) =>
  new RegExp(`\\.${cls.replace(/[-]/g, "\\-")}(?![\\w-])`, "m").test(cssSrc)

/** Exported as a function, const, or re-export. */
const reactHas = (sym) =>
  new RegExp(
    `export\\s+(?:default\\s+)?(?:function|const|class)\\s+${sym}\\b` +
    `|export\\s*\\{[^}]*\\b${sym}\\b[^}]*\\}` +
    `|export\\s+const\\s+${sym}\\s*=`,
    "m"
  ).test(reactSrc)

const missingCss = []
const missingReact = []

for (const it of reg.items) {
  if (it.css && !cssHas(it.css)) missingCss.push(`${it.name} → .${it.css}`)
  if (it.react && !reactHas(it.react)) missingReact.push(`${it.name} → <${it.react}>`)
}

const byLayer = reg.items.reduce((m, i) => ((m[i.layer] = (m[i.layer] ?? 0) + 1), m), {})

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ total: reg.items.length, byLayer, missingCss, missingReact }, null, 2))
  process.exit(missingCss.length + missingReact.length ? 1 : 0)
}

console.log(`Registry coverage — ${reg.items.length} items\n`)
for (const [layer, n] of Object.entries(byLayer)) {
  console.log(`  ${String(n).padStart(3)}  ${layer.padEnd(11)} ${reg.layers[layer] ?? ""}`)
}

if (missingCss.length) {
  console.log(`\nMissing CSS (${missingCss.length}):`)
  for (const m of missingCss) console.log(`  ✗ ${m}`)
}
if (missingReact.length) {
  console.log(`\nMissing React (${missingReact.length}):`)
  for (const m of missingReact) console.log(`  ✗ ${m}`)
}

const gaps = missingCss.length + missingReact.length
if (gaps) {
  console.error(`\n${gaps} unimplemented registry entries. Implement them, or remove them from registry.json — do not ship a manifest that lies.`)
  process.exit(1)
}
console.log(`\nEvery registry entry resolves to a real class and a real export.`)
