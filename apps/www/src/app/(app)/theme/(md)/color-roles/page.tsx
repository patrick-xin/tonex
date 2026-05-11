import { ScrollArea } from '@/components/ui/scroll-area'
import { ColorRolesList } from '@/features/color-roles-list'

export default function RolesPage() {
  return (
    <ScrollArea noScrollBar gradientScrollFade>
      <ColorRolesList />
    </ScrollArea>
  )
}
