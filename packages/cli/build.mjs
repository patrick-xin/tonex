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
import { build } from 'esbuild'

await build({
  entryPoints: ['src/cli.ts'],
  outfile: 'dist/cli.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  logLevel: 'info',
})
