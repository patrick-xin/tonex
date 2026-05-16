import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import type { Column } from '@tanstack/react-table'
import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInputGroupContent,
  ComboboxItemContent,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@/components/ui/combobox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TooltipTrigger } from '@/components/ui/tooltip'
import { OWNER_NAMES } from './data'
import { headerTooltipHandle } from './index'

interface ColumnHeaderComboboxProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  filterValue: string | null
}

export function ColumnHeaderCombobox<TData, TValue>({
  filterValue,
  column,
}: ColumnHeaderComboboxProps<TData, TValue>) {
  return (
    <Combobox
      autoHighlight
      items={OWNER_NAMES}
      modal
      onValueChange={(value) => {
        column.setFilterValue(value)
      }}
      value={filterValue}
    >
      <div className="flex gap-1 items-center text-left">
        <ComboboxTrigger
          render={(props, state) => (
            <TooltipTrigger
              {...props}
              disabled={state.open}
              handle={headerTooltipHandle}
              payload={{ text: 'Filter by owner' }}
              render={
                <Button className="justify-start cursor-pointer" size="sm" variant="ghost">
                  <ComboboxValue placeholder={<span className="text-foreground">Owner</span>} />
                  <span className="size-4">{!filterValue && <User className="size-4" />}</span>
                </Button>
              }
            />
          )}
        />
      </div>
      <ComboboxContent matchAnchorWidth={false}>
        <ComboboxInputGroupContent
          autoFocus
          embedded
          addonIcon={<MagnifyingGlassIcon />}
          placeholder="Search owner..."
          className="min-h-0 py-1"
        />
        <ScrollArea className="h-48" gradientScrollFade noScrollBar>
          <ComboboxEmpty>No owner found.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItemContent indicatorPlacement="end" key={item} value={item}>
                {item}
              </ComboboxItemContent>
            )}
          </ComboboxList>
        </ScrollArea>
      </ComboboxContent>
    </Combobox>
  )
}
