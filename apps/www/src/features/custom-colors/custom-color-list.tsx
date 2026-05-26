'use client'

import { DotsThreeVerticalIcon, PencilIcon, TrashIcon } from '@phosphor-icons/react'
import { previewCustomColor, selectSeedHex, useSource } from '@tonex/core'
import { type CustomColorEntry, slugifyCustomColorName } from '@tonex/core/schema'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useActiveMode } from '@/features/theme-mode'
import { useLayer } from '@/lib/layer-context'
import { CustomColorDialogDescription, CustomColorFormBody } from './custom-color-form'
import { NewCustomColor } from './new-custom-color'
import { useCustomColorForm } from './use-custom-color-form'

export function CustomColorList() {
  const customColors = useSource((s) => s.customColors)
  const removeCustomColor = useSource((s) => s.actions.removeCustomColor)
  const [editing, setEditing] = useState<CustomColorEntry | null>(null)

  if (customColors.length === 0) {
    return (
      <div className="p-2">
        <div className="flex items-center justify-between">
          <div className="font-medium text-on-surface text-sm">Custom colors</div>
          <NewCustomColor iconSize="icon-xs" icon />
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-medium text-on-surface text-sm">Custom colors</div>
        <NewCustomColor iconSize="icon-xs" icon />
      </div>
      <div className="flex flex-col gap-2">
        {customColors.map((cc) => (
          <CustomColorCard
            key={cc.id}
            entry={cc}
            onEdit={() => setEditing(cc)}
            onDelete={() => removeCustomColor(cc.id)}
          />
        ))}
      </div>

      {editing && (
        <EditCustomColorDialog
          entry={editing}
          open={!!editing}
          onOpenChange={(open) => {
            if (!open) setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function CustomColorCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: CustomColorEntry
  onEdit: () => void
  onDelete: () => void
}) {
  const seedHex = useSource(selectSeedHex)
  const mode = useActiveMode()
  const preview = previewCustomColor(seedHex, { hex: entry.hex, blend: entry.blend })
  // why: pre-hydration we render transparent placeholders for the 4 swatch
  // slots — preserves grid layout while not committing to a (wrong) color
  // before useActiveMode resolves. The grid is `grid-cols-2 gap-0.5 shrink-0`
  // around 4 `size-3.5 rounded-full` divs, so empty fills keep their footprint.
  const roles =
    mode !== null
      ? [
          preview[mode].color,
          preview[mode].onColor,
          preview[mode].colorContainer,
          preview[mode].onColorContainer,
        ]
      : ['transparent', 'transparent', 'transparent', 'transparent']

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-high">
      <div className="grid grid-cols-2 gap-0.5 shrink-0">
        {roles.map((hex, i) => (
          <div key={String(i)} className="size-3.5 rounded-full" style={{ backgroundColor: hex }} />
        ))}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{entry.name}</p>
        <p className="text-xs text-on-surface-variant font-mono">{entry.hex}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" className="data-popup-open:bg-primary/12">
              <DotsThreeVerticalIcon />
            </Button>
          }
        />
        <DropdownMenuContent align="end" matchAnchorWidth={false}>
          <DropdownMenuItem onClick={onEdit}>
            <PencilIcon />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} variant="destructive">
            <TrashIcon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function EditCustomColorDialog({
  entry,
  open,
  onOpenChange,
}: {
  entry: CustomColorEntry
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const customColors = useSource((s) => s.customColors)
  const updateCustomColor = useSource((s) => s.actions.updateCustomColor)
  const layer = useLayer()

  // why: exclude self when validating an edit so the entry's existing slug
  // doesn't trip the duplicate check against itself.
  const otherSlugs = new Set(
    customColors.filter((e) => e.id !== entry.id).map((e) => slugifyCustomColorName(e.name)),
  )
  const form = useCustomColorForm(
    {
      name: entry.name,
      description: entry.description ?? '',
      hex: entry.hex,
      blend: entry.blend,
      shadcnSource: entry.shadcnSource,
    },
    otherSlugs,
  )

  const handleSave = () => {
    const trimmed = form.name.trim()
    if (!trimmed) return
    try {
      updateCustomColor(entry.id, {
        name: trimmed,
        description: form.description.trim() || undefined,
        hex: form.colorHex,
        blend: form.blend,
        shadcnSource: form.shadcnSource,
      })
      onOpenChange(false)
    } catch (err) {
      form.setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit custom color</DialogTitle>
          <CustomColorDialogDescription layer={layer} />
        </DialogHeader>

        <CustomColorFormBody form={form} layer={layer} onEnter={handleSave} />

        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button onClick={handleSave} disabled={form.draftError !== null}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
