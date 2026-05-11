import { ScrollArea } from '@/components/ui/scroll-area'
import { ShadcnRoleOverrideList } from '@/features/shadcn-role-override'

export default function ShadcnPalettesPage() {
  return (
    <ScrollArea noScrollBar gradientScrollFade>
      <ShadcnRoleOverrideList />
    </ScrollArea>
  )
}
