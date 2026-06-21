import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerDragHandle,
  DrawerHeader,
  DrawerPopup,
  DrawerPortal,
  DrawerSelectable,
  DrawerTitle,
  DrawerTrigger,
  DrawerViewport,
} from '@/components/ui/drawer'
import { ScrollAreaContent, ScrollAreaRoot, ScrollAreaViewport } from '@/components/ui/scroll-area'
import { source } from '../utils/source'
import { DocsNavLinks } from './docs-nav-links'
import { DocsSidebarTree } from './docs-sidebar-tree'

export function DocsNav() {
  return (
    <Drawer>
      <DrawerTrigger
        render={
          <Button size="icon-sm" variant="ghost" aria-label="Open navigation">
            <Menu />
          </Button>
        }
      />
      <DrawerPortal>
        <DrawerBackdrop />
        <DrawerViewport>
          <ScrollAreaRoot
            className="h-full overscroll-contain transition-[transform,translate] duration-600 ease-[cubic-bezier(0.45,1.005,0,1.005)] group-data-[starting-style]:translate-y-[100dvh] group-data-[ending-style]:pointer-events-none"
            style={{ position: undefined }}
          >
            <ScrollAreaViewport className="h-full overscroll-contain touch-auto">
              <ScrollAreaContent className="flex min-h-full items-end justify-center pt-8 md:py-16 md:px-16">
                <DrawerPopup className="w-full max-w-[42rem] outline-none transition-transform duration-800 ease-[cubic-bezier(0.45,1.005,0,1.005)] [transform:translateY(var(--drawer-swipe-movement-y))] data-[swiping]:select-none data-[ending-style]:[transform:translateY(calc(max(100dvh,100%)+2px))] data-[ending-style]:duration-350 data-[ending-style]:ease-[cubic-bezier(0.375,0.015,0.545,0.455)] rounded-t-2xl md:rounded-xl">
                  <nav
                    aria-label="Navigation"
                    className="relative flex flex-col bg-surface pt-4 pb-6 border-t border-outline-variant transition-shadow duration-350 ease-[cubic-bezier(0.375,0.015,0.545,0.455)] rounded-t-2xl md:rounded-xl"
                  >
                    <DrawerDragHandle className="mb-4" />
                    <DrawerClose
                      aria-label="Close menu"
                      className="absolute top-2 right-2"
                      render={
                        <Button size="icon-sm" variant="outline">
                          <X />
                        </Button>
                      }
                    />
                    <DrawerSelectable className="w-full">
                      <DrawerHeader className="px-5">
                        <DrawerTitle>Documentation</DrawerTitle>
                      </DrawerHeader>
                      <DocsSidebarTree
                        tree={source.pageTree}
                        className="px-2"
                        linkWrapper={(link) => <DrawerClose nativeButton={false} render={link} />}
                      />
                      <DocsNavLinks className="px-2" />
                    </DrawerSelectable>
                  </nav>
                </DrawerPopup>
              </ScrollAreaContent>
            </ScrollAreaViewport>
          </ScrollAreaRoot>
        </DrawerViewport>
      </DrawerPortal>
    </Drawer>
  )
}
