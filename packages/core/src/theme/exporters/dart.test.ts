import { describe, expect, it } from 'vitest'
import { deriveTheme } from '../derive'
import { DEFAULT_INPUTS } from '../schema'
import type { ContrastBundle } from './bundle'
import { exportDart } from './dart'

// why: planner-authored Red contract for the Dart exporter, slice dart-1. Per
// working-style.md "the planner writes the contract; the implementer makes it
// pass." Mirrors json.test.ts's stance: the captured Flutter sample
// (`__fixtures__/material-theme-builder.dart`) is a SHAPE oracle, not a value
// or field-by-field oracle. We assert structure (the MaterialTheme class, the
// ColorScheme field set, the encoding) against what Flutter's ColorScheme can
// hold — never a specific color, and deliberately diverging from the sample
// where the sample is narrower than our roster.
//
// Slice scope (agreed): default light + dark ColorScheme only. Contrast tiers
// (the 6-method form) land in slice dart-2; chart / palette channels in dart-3.
//
// Two deliberate divergences from MTB's sample, both flowing from "we are not a
// fork of MTB — ship every tonex token Flutter can represent, fix what's
// broken":
//   1. We emit `onInverseSurface` (our `--color-inverse-on-surface`). Flutter's
//      ColorScheme HAS the field; MTB's sample just omits it.
//   2. We modernize the deprecated `scaffoldBackgroundColor: colorScheme
//      .background` (removed in current Flutter) to `.surface`, so emitted code
//      compiles warning-free.

// why: a representative slice of the 46 ColorScheme fields — one per family
// edge that pins the contract: a plain role, a container, an `on*`, the
// fixed/dim family (camelCases cleanly), the surface-container ramp tail, and
// `onInverseSurface` (the one field whose name does NOT follow the naive
// `--color-…` → camelCase transform, so it proves the explicit mapping).
const REPRESENTATIVE_FIELDS = [
  'primary',
  'onPrimaryContainer',
  'surfaceTint',
  'onInverseSurface',
  'inversePrimary',
  'primaryFixedDim',
  'onPrimaryFixedVariant',
  'shadow',
  'scrim',
  'surfaceContainerHighest',
] as const

// why: tokens with no ColorScheme field. The four `*-dim` role tokens are
// tonex extensions Flutter's ColorScheme has no slot for; chart / palette are
// separate families deferred to later slices. Their absence is the contract —
// divergence visible by construction (ADR-0029), never a fabricated field.
const NO_SLOT_TOKENS = ['primaryDim', 'secondaryDim', 'tertiaryDim', 'errorDim', 'chart1'] as const

// why: 50 MD_TOKEN_NAMES minus the four `*-dim` role tokens = 46 ColorScheme
// fields, emitted for both light and dark = 92 opaque Color literals total.
// Pinning the count guards against a field silently dropping out of the roster.
const COLOR_SCHEME_FIELD_COUNT = 46

describe('exportDart — Flutter MaterialTheme, our tokens (slice dart-1)', () => {
  const bundle: ContrastBundle = { default: deriveTheme(DEFAULT_INPUTS) }
  const out = exportDart(bundle)

  it('emits the flutter import and a MaterialTheme class', () => {
    expect(out).toContain('import "package:flutter/material.dart";')
    expect(out).toContain('class MaterialTheme {')
  })

  it('emits light + dark ColorScheme factories with the matching Brightness', () => {
    expect(out).toMatch(/static ColorScheme lightScheme\(\) \{\s*return const ColorScheme\(/)
    expect(out).toMatch(/static ColorScheme darkScheme\(\) \{\s*return const ColorScheme\(/)
    expect(out).toContain('brightness: Brightness.light,')
    expect(out).toContain('brightness: Brightness.dark,')
  })

  it('emits the light()/dark() ThemeData methods and the theme() builder', () => {
    expect(out).toContain('ThemeData light() {')
    expect(out).toContain('ThemeData dark() {')
    expect(out).toContain('ThemeData theme(ColorScheme colorScheme)')
  })

  it('includes every representative ColorScheme field, incl. onInverseSurface', () => {
    for (const field of REPRESENTATIVE_FIELDS) {
      expect(out).toContain(`${field}: Color(0x`)
    }
  })

  it('omits tokens Flutter ColorScheme has no slot for (*-dim, chart, palette)', () => {
    for (const token of NO_SLOT_TOKENS) {
      expect(out).not.toContain(`${token}:`)
    }
  })

  it('encodes every color as an opaque lowercase ARGB Color literal', () => {
    const literals = out.match(/Color\(0x[0-9a-fA-F]{8}\)/g) ?? []
    expect(literals).toHaveLength(COLOR_SCHEME_FIELD_COUNT * 2)
    for (const lit of literals) {
      expect(lit).toMatch(/^Color\(0xff[0-9a-f]{6}\)$/)
    }
  })

  it('modernizes the deprecated scaffold background (no colorScheme.background)', () => {
    expect(out).not.toContain('colorScheme.background')
    expect(out).toContain('scaffoldBackgroundColor: colorScheme.surface,')
  })

  it('does not emit contrast-tier schemes yet (deferred to slice dart-2)', () => {
    expect(out).not.toContain('MediumContrast')
    expect(out).not.toContain('HighContrast')
  })
})
