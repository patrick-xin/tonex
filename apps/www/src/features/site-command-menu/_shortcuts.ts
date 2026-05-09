import type { Dialog as BaseDialog, Popover as BasePopover } from '@base-ui/react'
import { QuestionMarkIcon } from '@phosphor-icons/react'
import { Contrast, Download, Settings } from 'lucide-react'
import {
  checkContrastDialogHandle,
  exportDialogHandle,
  helpDialogHandle,
  shadcnSettingsPopoverHandle,
} from '@/lib/handles'

export interface Item {
  value: string
  label: string
  href?: string
  icon: React.ElementType
  shortcut?: string
  handle?: BaseDialog.Handle<null>
  popoverHandle?: BasePopover.Handle<null>
}

export interface Group {
  value: string
  items: Item[]
}

export const BASE_SHORTCUTS: Item[] = [
  {
    icon: Download,
    label: 'Export',
    value: 'export',
    shortcut: 'E',
    handle: exportDialogHandle,
  },
  {
    icon: Contrast,
    label: 'Check Contrast',
    shortcut: '⌘+C',
    value: 'check-contrast',
    handle: checkContrastDialogHandle,
  },
  {
    icon: Settings,
    label: 'Settings',
    shortcut: 'S',
    value: 'settings',
    popoverHandle: shadcnSettingsPopoverHandle,
  },
  {
    icon: QuestionMarkIcon,
    label: 'Help',
    shortcut: 'H',
    value: 'help',
    handle: helpDialogHandle,
  },
]
