import { ShadcnRoleOverrideList } from '@/features/shadcn-role-override'

// why: ADR-0026 slice override-3 — promotes the override editor into the
// segmented shadcn route per ADR-0019. The "Palettes" tab in shadcn nav
// already pointed here; this slice gives it a destination. Wrapping is
// handled by the (shadcn)/shadcn layout (LayerProvider, MdRail, NavTabs,
// ShadcnProvider scope around the canvas).
export default function ShadcnPalettesPage() {
  return (
    <div className="overflow-auto">
      <ShadcnRoleOverrideList />
    </div>
  )
}
