import type {
  AlertDialog as BaseAlertDialog,
  Dialog as BaseDialog,
  Popover as BasePopover,
} from '@base-ui/react'
import {
  CircleQuestionMarkIcon,
  Contrast,
  CopyIcon,
  Download,
  RotateCcwIcon,
  Settings,
} from 'lucide-react'
import type { HelpSection } from '@/features/help-dialog/help-sections'
import {
  checkContrastDialogHandle,
  exportDialogHandle,
  helpDialogHandle,
  resetDialogHandle,
  settingsPopoverHandle,
} from '@/lib/handles'

export interface Item {
  value: string
  label: string
  href?: string
  disabled?: boolean
  icon: React.ElementType
  shortcut?: string
  // why: most handles carry no payload; the Help handle deep-links to a section.
  // The command menu only ever uses these as no-payload DialogTriggers, so the
  // payload type is irrelevant here — the union just keeps the typed Help handle
  // assignable.
  handle?: BaseDialog.Handle<null> | BaseDialog.Handle<HelpSection>
  popoverHandle?: BasePopover.Handle<null>
  // Reset rides an AlertDialog (a distinct Base UI primitive from `handle`'s
  // Dialog), so it gets its own field + AlertDialogTrigger branch in the menu.
  alertDialogHandle?: BaseAlertDialog.Handle<null>
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
    icon: CopyIcon,
    label: 'Quick Copy',
    value: 'quick-export',
    shortcut: 'E then C',
    handle: exportDialogHandle,
  },
  {
    icon: Contrast,
    label: 'Check Contrast',
    shortcut: 'A',
    value: 'check-contrast',
    handle: checkContrastDialogHandle,
  },
  {
    icon: Settings,
    label: 'Settings',
    shortcut: 'S',
    value: 'settings',
    popoverHandle: settingsPopoverHandle,
  },
  {
    icon: RotateCcwIcon,
    label: 'Reset to defaults',
    shortcut: 'R',
    value: 'reset',
    alertDialogHandle: resetDialogHandle,
  },
  {
    icon: CircleQuestionMarkIcon,
    label: 'Help',
    shortcut: 'H',
    value: 'help',
    handle: helpDialogHandle,
  },
]
