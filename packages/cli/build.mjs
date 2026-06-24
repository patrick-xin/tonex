// Bundle the CLI into a single self-contained ESM file for npm publish.
//
// why: @tonex/core, @tonex/color-utils, @tonex/mcu, culori, and valibot are all
// workspace / runtime inputs that are NOT published to npm. esbuild inlines them
// so the published `tonex` package needs ZERO runtime dependencies — only Node's
// own builtins stay external. (Bundle-for-v0; publishing the engine as its own
// npm packages is a later slice — see ADR-0039 and the OSS-extraction line.)
//
// The pure `run(argv, io)` seam means this is a mechanical compile, not a
// refactor: src/cli.ts is the bin, everything else folds in behind it. esbuild
// preserves the entry's `#!/usr/bin/env node` shebang in the output.

import { copyFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

// why: npm always includes a root-named LICENSE in the published tarball,
// even with `files: ["dist"]`. The repo keeps ONE canonical Apache-2.0
// LICENSE at the monorepo root; copy it in at build/publish time so the
// published `tonex` package carries the license without a committed
// duplicate that could drift. build.mjs is the CLI's prepublishOnly, which
// runs before npm packs, so the copy is present at pack time.
const here = dirname(fileURLToPath(import.meta.url))
const rootLicense = resolve(here, '../../LICENSE')
if (existsSync(rootLicense)) {
  copyFileSync(rootLicense, resolve(here, 'LICENSE'))
} else {
  console.warn('[build] root LICENSE not found — published tarball will lack a LICENSE file')
}

await build({
  entryPoints: ['src/cli.ts'],
  outfile: 'dist/cli.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  logLevel: 'info',
})
