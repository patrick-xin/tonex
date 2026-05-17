import { createDialogHandle } from '@/components/ui/dialog'
import { createPopoverHandle } from '@/components/ui/popover'
/**
 * Centralized dialog handles for site-wide command menu integration.
 * Add new handles here as features are onboarded.
 */
export const exportDialogHandle = createDialogHandle<null>()
export const checkContrastDialogHandle = createDialogHandle<null>()
export const helpDialogHandle = createDialogHandle<null>()
export const settingsPopoverHandle = createPopoverHandle<null>()
export const md3SettingsPopoverHandle = createPopoverHandle<null>()
