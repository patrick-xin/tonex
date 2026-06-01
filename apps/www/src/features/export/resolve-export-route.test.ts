import { describe, expect, it } from 'vitest'
import { type ExportTab, resolveExportRoute } from './resolve-export-route'

// why: the export hook's promise is WYSIWYG (ADR-0021 c.7) — the pane shows what
// the user pastes. That rests on three routing decisions per tab: which core
// exporter runs, the file extension, and whether a provenance header is
// prepended. Those used to be scattered across six return sites in a
// store-coupled useMemo, so nothing pinned them and a new tab could fall through
// silently. This is www's own seam (tab → routing); the exporter *body* shapes
// are @tonex/core's contract and are deliberately NOT tested here. The switch is
// exhaustive over ExportTab, so adding a seventh tab is a compile error until it
// gets a route — the drift guard is the type, this pins the table it produces.

describe('resolveExportRoute', () => {
  it('routes each tab to its exporter, extension, and header policy', () => {
    expect(resolveExportRoute('Tailwind')).toEqual({
      exporter: 'css',
      layer: 'md',
      ext: 'css',
      header: true,
    })
    expect(resolveExportRoute('shadcn')).toEqual({
      exporter: 'css',
      layer: 'shadcn',
      ext: 'css',
      header: true,
    })
    expect(resolveExportRoute('CSS')).toEqual({ exporter: 'nativeCss', ext: 'css', header: true })
    expect(resolveExportRoute('JSON')).toEqual({ exporter: 'json', ext: 'json', header: false })
    expect(resolveExportRoute('Dart')).toEqual({ exporter: 'dart', ext: 'dart', header: false })
    expect(resolveExportRoute('Design.md')).toEqual({
      exporter: 'designMd',
      ext: 'md',
      header: false,
    })
  })

  it('prepends a provenance header only on the CSS-family tabs', () => {
    // the load-bearing partition: a /* */ banner is valid CSS, but breaks a JSON
    // parse and a DESIGN.md `colors:` paste. The data formats must stay
    // header-free — flip one and the user's paste silently corrupts.
    const cssFamily: ExportTab[] = ['Tailwind', 'CSS', 'shadcn']
    const dataFormats: ExportTab[] = ['JSON', 'Dart', 'Design.md']
    for (const tab of cssFamily) expect(resolveExportRoute(tab).header).toBe(true)
    for (const tab of dataFormats) expect(resolveExportRoute(tab).header).toBe(false)
  })
})
