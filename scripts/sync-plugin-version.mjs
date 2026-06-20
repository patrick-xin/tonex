// Single source of truth for the published version is packages/cli/package.json
// (the `tonex` npm package). The skill drives that CLI, so the three plugin
// manifests must release in lockstep — this script copies the CLI version into
// them so the number is never hand-duplicated in four places.
//
//   node scripts/sync-plugin-version.mjs          # write the CLI version into the manifests
//   node scripts/sync-plugin-version.mjs --check   # exit 1 if any manifest has drifted (CI/pre-commit guard)
//
// The marketplace.json carries no version (it lists plugins, it isn't one), so
// it's deliberately absent from the target list.
import { readFileSync, writeFileSync } from 'node:fs'

const check = process.argv.includes('--check')

const source = JSON.parse(readFileSync('packages/cli/package.json', 'utf8'))
const version = source.version

const targets = [
  '.claude-plugin/plugin.json',
  '.codex-plugin/plugin.json',
  '.cursor-plugin/plugin.json',
]

let drift = false
for (const file of targets) {
  const json = JSON.parse(readFileSync(file, 'utf8'))
  if (json.version === version) continue
  if (check) {
    console.error(`  drift: ${file} is ${json.version}, expected ${version}`)
    drift = true
    continue
  }
  json.version = version
  writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`)
  console.log(`  synced ${file} → ${version}`)
}

if (check && drift) {
  console.error('plugin manifests are out of sync — run `pnpm plugin:version`')
  process.exit(1)
}
console.log(check ? `all manifests match ${version}` : `done — manifests at ${version}`)
