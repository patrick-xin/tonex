import { ScrollArea } from '@/components/ui/scroll-area'
import { ShadcnChartOverrideList, ShadcnRoleOverrideList } from '@/features/shadcn-override'

// why: ADR-0026 slice override-3 promoted the role override editor here;
// ADR-0027 slice chart-3 mounts the chart override editor below it as a
// parallel surface (separate seam: distinct token domain, distinct theme
// field, distinct override store axis).
export default function ShadcnPalettesPage() {
  return (
    <ScrollArea noScrollBar gradientScrollFade>
      <div className="flex flex-col gap-6 py-6">
        <ShadcnRoleOverrideList />
        <ShadcnChartOverrideList />
      </div>
    </ScrollArea>
  )
}
