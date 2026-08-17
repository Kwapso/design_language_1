#!/usr/bin/env node
/* Thin wrapper so consuming apps can run `npx structure-lint src/`. */
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
const here = dirname(fileURLToPath(import.meta.url))
spawn(process.execPath, [join(here, "../scripts/cognitive-load.mjs"), ...process.argv.slice(2)], { stdio: "inherit" })
  .on("exit", (code) => process.exit(code ?? 0))
