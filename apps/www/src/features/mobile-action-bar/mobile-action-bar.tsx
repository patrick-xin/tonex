'use client'

import {
  ArrowsLeftRightIcon,
  CircleHalfIcon,
  DotsThreeIcon,
  DownloadIcon,
  GearSixIcon,
  GithubLogoIcon,
  PaletteIcon,
  QuestionIcon,
  XLogoIcon,
} from '@phosphor-icons/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import { ThemeModeToggle } from '@/components/shared/theme-mode-toggle'
import { Button } from '@/components/ui/button'
import { DrawerTrigger } from '@/components/ui/drawer'
import {
  createSheetHandle,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  checkContrastDialogHandle,
  exportDialogHandle,
  helpDialogHandle,
  railDrawerHandle,
  settingsDrawerHandle,
} from '@/lib/handles'

const moreSheetHandle = createSheetHandle<null>()

// why: ADR-0022 surface feature. The desktop chrome cluster (features/nav-tabs,
// `hidden sm:flex`) and the desktop rail footer are unreachable below sm; this
// bar is their `sm:hidden` home (issue #142, variant C). Export/Contrast/Help
// mount NO second dialogs — those single instances live in the (hidden) nav-tabs
// cluster and are driven here through their handles, exactly as the command menu
// drives them (one hotkey registration, one dialog per feature; the bar only adds
// visible triggers). Settings is the exception: the desktop popover anchors to a
// hidden trigger below sm, so the bar opens a dedicated bottom drawer instead
// (settingsDrawer / settingsDrawerHandle) that re-renders the same SettingsFields.
//
// railDrawer is the layer's drawer content (MdRailDrawer / ShadcnRailDrawer) and
// settingsDrawer the layer's SettingsDrawer, both mounted here so their triggers
// (railDrawerHandle / settingsDrawerHandle) can open content the layout owns.
// crossLink comes straight from NavConfig (serializable), so the layout passes it
// without the RSC icon-bridge that nav-tabs needs.
export function MobileActionBar({
  crossLink,
  railDrawer,
  settingsDrawer,
}: {
  crossLink: { label: string; href: string }
  railDrawer: React.ReactNode
  settingsDrawer: React.ReactNode
}) {
  const router = useRouter()
  // why: the cross-link navigates to the sibling layer's route group, which
  // tears down THIS layout (and the open Sheet) on click. Navigating straight
  // from inside the open modal unmounts it mid-close, before Base UI releases
  // its scroll lock / inert state — leaving the destination page frozen until a
  // refresh (mobile-shadcn-freeze). So we close first and defer the push to
  // onOpenChangeComplete, after the lock is released. The ref distinguishes a
  // navigate-intent close from a plain dismiss (backdrop, close button).
  const pendingHref = useRef<string | null>(null)
  return (
    <>
      {railDrawer}
      {settingsDrawer}
      {/* Floating icon pill: content-width, centered, lifted off the bottom edge by a
          transparent gutter so it reads as floating above the canvas (issue #142,
          variant C polish). All actions are equal-weight ghost icons; Build is the only
          brand-tinted one. text-on-surface-variant on the row mutes the rest; each icon
          inherits via currentColor. */}
      <div className="sm:hidden flex-none px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-md border border-outline-variant/50 bg-surface-container-high px-3 py-1 text-on-surface-variant elevation-2">
          <DrawerTrigger
            handle={railDrawerHandle}
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Build theme"
                className="text-primary"
              />
            }
          >
            <PaletteIcon />
          </DrawerTrigger>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Export"
            onClick={() => exportDialogHandle.open(null)}
          >
            <DownloadIcon />
          </Button>
          <DrawerTrigger
            handle={settingsDrawerHandle}
            render={<Button variant="ghost" size="icon" aria-label="Settings" />}
          >
            <GearSixIcon />
          </DrawerTrigger>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Contrast checker"
            onClick={() => checkContrastDialogHandle.open(null)}
          >
            <CircleHalfIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Help"
            onClick={() => helpDialogHandle.open(null)}
          >
            <QuestionIcon />
          </Button>
          <Sheet
            handle={moreSheetHandle}
            onOpenChangeComplete={(open) => {
              if (open || !pendingHref.current) return
              const href = pendingHref.current
              pendingHref.current = null
              router.push(href)
            }}
          >
            <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="More tools" />}>
              <DotsThreeIcon />
            </SheetTrigger>
            <SheetContent
              side="bottom"
              showCloseButton
              className="px-4 pt-10 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
            >
              {/* Visually hidden but kept as the sheet's accessible name (required
                  for the dialog a11y tree). pt-10 clears the absolutely-positioned
                  close button (top-2, size-8) now that the title is sr-only. */}
              <SheetTitle className="sr-only">More</SheetTitle>
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  nativeButton={false}
                  className="justify-start gap-3"
                  render={
                    <Link
                      href={crossLink.href}
                      onClick={(e) => {
                        e.preventDefault()
                        pendingHref.current = crossLink.href
                        moreSheetHandle.close()
                      }}
                    />
                  }
                >
                  <ArrowsLeftRightIcon className="size-5" />
                  Switch to {crossLink.label}
                </Button>
                <div className="mt-2 flex items-center justify-start border-t border-outline-variant/40 pt-3">
                  <div className="flex items-center gap-0.5">
                    <ThemeModeToggle />
                    <Button variant="ghost" size="icon-sm" aria-label="GitHub">
                      <GithubLogoIcon className="size-5 text-on-surface-variant" weight="fill" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" aria-label="X">
                      <XLogoIcon className="size-5 text-on-surface-variant" weight="fill" />
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
