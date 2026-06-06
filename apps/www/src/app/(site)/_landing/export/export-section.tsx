import { type ExportTab, tabToHighlightLang } from '@/features/export'
import { highlightCode } from '@/lib/highlight'
import { SectionHeader } from '../section-header'
import { EXPORT_CODE } from './export-code'
import { ExportTabs } from './export-tabs'

// why: highlight the landing's demo code on the server — it's static, so the
// tokenized markup is built once at render and the client tabs only toggle
// which pre is visible. Zero runtime highlight cost, and it shares the one
// highlighter singleton with the runtime export view (lib/highlight) so the
// same CSS block looks identical on both surfaces.
//
// why 'use cache': cacheComponents (next.config) prerenders this route, but
// Shiki's codeToHtml reads Date.now() internally — forbidden in a server
// component prerender unless it runs in a cache scope. The input is a hardcoded
// constant (EXPORT_CODE), so the highlighted map is deterministic and computed
// once; caching it both silences the prerender error and skips re-highlighting
// on every request.
async function highlightExportCode(): Promise<Record<ExportTab, string>> {
  'use cache'
  const tabs = Object.keys(EXPORT_CODE) as ExportTab[]
  const entries = await Promise.all(
    tabs.map(
      async (tab) => [tab, await highlightCode(EXPORT_CODE[tab], tabToHighlightLang(tab))] as const,
    ),
  )
  return Object.fromEntries(entries) as Record<ExportTab, string>
}

export async function ExportSection() {
  const highlighted = await highlightExportCode()
  return (
    <section className="relative flex flex-col mx-auto py-12 sm:py-24">
      <SectionHeader
        heading="Export fomat you can use in seconds"
        description="Export in the format your stack already speaks, paste it in, and there's nothing left to re-theme."
      />
      <ExportTabs highlighted={highlighted} />
    </section>
  )
}
