import type { Metadata } from 'next'
import { ShadcnChartOverrideList, ShadcnRoleOverrideList } from '@/features/shadcn-override'

export const metadata: Metadata = {
  title: 'Color Roles',
  description: 'Color roles',
}

// why: ADR-0026 slice override-3 promoted the role override editor here;
// ADR-0027 slice chart-3 mounts the chart override editor below it as a
// parallel surface
export default function ShadcnPalettesPage() {
  return (
    <div className="flex flex-col gap-6 py-2">
      <ShadcnRoleOverrideList />
      <ShadcnChartOverrideList />
    </div>
  )
}
