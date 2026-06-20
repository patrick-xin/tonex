// Pre-publish step: fill the plugin manifests' contact email from the
// $TONEX_CONTACT_EMAIL environment variable, so a personal address is never
// committed to the repo. The committed manifests carry name + url only.
//
//   TONEX_CONTACT_EMAIL=hello@example.com node scripts/inject-plugin-contact.mjs
//
// No-op (exit 0) when the env var is unset, so it's safe to wire into a build.
// After publishing you can `git checkout` the manifests to drop the email again.
import { readFileSync, writeFileSync } from 'node:fs'

const email = process.env.TONEX_CONTACT_EMAIL?.trim()
if (!email) {
  console.error('TONEX_CONTACT_EMAIL not set — leaving manifests email-free.')
  process.exit(0)
}

// key = the object that carries the contact (author for plugins, owner for the marketplace)
const targets = [
  { file: '.claude-plugin/plugin.json', key: 'author' },
  { file: '.claude-plugin/marketplace.json', key: 'owner' },
  { file: '.cursor-plugin/plugin.json', key: 'author' },
  { file: '.codex-plugin/plugin.json', key: 'author' },
]

for (const { file, key } of targets) {
  const json = JSON.parse(readFileSync(file, 'utf8'))
  if (json[key]) {
    json[key].email = email
    writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`)
    console.log(`  injected ${key}.email → ${file}`)
  }
}
console.log('done — run `pnpm format` if your publish pipeline cares about JSON style.')
