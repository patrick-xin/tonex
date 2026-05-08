'use client'

import { SearchIcon } from 'lucide-react'
import { cn } from 'tailwind-variants'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Chip } from '@/components/ui/chip'
import { Input } from '@/components/ui/input'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const HOLDINGS = [
  {
    ticker: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    type: 'ETF',
    added: 'Jan 2021',
    shares: '112',
    value: '$48,230.40',
  },
  {
    ticker: 'VIG',
    name: 'Vanguard Dividend Appreciation',
    type: 'ETF',
    added: 'Mar 2022',
    shares: '450',
    value: '$26,033.79',
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    type: 'Stock',
    added: 'Nov 2020',
    shares: '85',
    value: '$18,488.90',
  },
  {
    ticker: 'O',
    name: 'Realty Income Corp',
    type: 'REIT',
    added: 'Jun 2023',
    shares: '320',
    value: '$15,136.59',
  },
]

export function ReleaseCatalog({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <Card className={cn(className)} {...props}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="max-w-sm relative">
            <div>
              <SearchIcon className="text-on-surface-variant size-4 absolute top-1/2 left-3 -translate-y-1/2" />
            </div>
            <Input placeholder="Search holdings or tickers..." className="pl-8" />
          </div>
          <ToggleGroup defaultValue={['etfs']} variant="outline" spacing={1}>
            <ToggleGroupItem value="stocks">Stocks</ToggleGroupItem>
            <ToggleGroupItem value="etfs">ETFs</ToggleGroupItem>
            <ToggleGroupItem value="reits">REITs</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        <ItemGroup>
          {HOLDINGS.map((holding) => (
            <Item key={holding.ticker} variant="default">
              <ItemMedia>
                <div className="flex size-12 items-center justify-center rounded-lg border border-outline-variant text-sm font-semibold">
                  {holding.ticker}
                </div>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{holding.name}</ItemTitle>
                <ItemDescription className="text-xs tracking-wider uppercase">
                  {holding.shares} Shares · {holding.added}
                </ItemDescription>
              </ItemContent>
              <div className="flex shrink-0 items-center gap-6">
                <Chip variant="outline">{holding.type}</Chip>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-xs tracking-wider text-on-surface-variant uppercase">
                    Value
                  </span>
                  <span className="font-medium tabular-nums">{holding.value}</span>
                </div>
              </div>
            </Item>
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  )
}
