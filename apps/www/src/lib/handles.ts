import { createDialogHandle } from '@/components/ui/dialog'
import { createDrawerHandle } from '@/components/ui/drawer'
import { createPopoverHandle } from '@/components/ui/popover'
import type { HelpSection } from '@/features/help-dialog/help-sections'
/**
 * Centralized dialog handles for site-wide command menu integration.
 * Add new handles here as features are onboarded.
 */
export const exportDialogHandle = createDialogHandle<null>()
export const checkContrastDialogHandle = createDialogHandle<null>()
// Payload = the help section to deep-link to. Plain opens (H hotkey, command
// menu, mobile tour fallback) use open(null) — a trigger id, not a payload — and
// land at the top with each accordion's defaults; openWithPayload(section)
// expands and scrolls to that section.
export const helpDialogHandle = createDialogHandle<HelpSection>()
export const settingsPopoverHandle = createPopoverHandle<null>()
// why: the rail drawer's trigger lives apart from its content on mobile — the
// "Build theme" button sits in the bottom action bar (features/mobile-action-bar)
// while the drawer content is mounted by the layout. The handle bridges them,
// same pattern as the dialog/popover handles above (issue #142).
export const railDrawerHandle = createDrawerHandle<null>()
