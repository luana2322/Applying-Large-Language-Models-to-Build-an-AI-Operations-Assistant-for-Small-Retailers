import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const scanRoots = [
  join(root, "src", "features", "custom-builder"),
  join(root, "src", "components", "shared", "layout"),
]

const forbidden = [
  /customBuilderMockAdapter/,
  /sampleRecords/,
  /previewLogicConnectorRule/,
  /Dry-run chi minh hoa/i,
  /chua chay workflow that/i,
  /Inventory va AI/i,
  /placeholder local/i,
]

const allowedSuffixes = [".test.ts", ".test.tsx"]
const violations = []

function walk(dir) {
  if (!existsSync(dir)) return
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      walk(fullPath)
      continue
    }
    if (!/\.(ts|tsx)$/.test(entry)) continue
    if (allowedSuffixes.some((suffix) => entry.endsWith(suffix))) continue
    const text = readFileSync(fullPath, "utf8")
    for (const pattern of forbidden) {
      if (pattern.test(text)) {
        violations.push(`${relative(root, fullPath)} matches ${pattern}`)
      }
    }
  }
}

for (const scanRoot of scanRoots) {
  walk(scanRoot)
}

if (violations.length > 0) {
  console.error(violations.join("\n"))
  process.exit(1)
}
