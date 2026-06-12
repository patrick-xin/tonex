'use client'

import { Bar, BarChart, XAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Chip } from '@/components/ui/chip'
import { Item, ItemContent, ItemDescription } from '@/components/ui/item'

const chartData = [
  { month: 'Dec', amount: 4500 },
  { month: 'Jan', amount: 6200 },
  { month: 'Feb', amount: 5100 },
  { month: 'Mar', amount: 7800 },
  { month: 'Apr', amount: 8900 },
  { month: 'May', amount: 9200 },
]

const chartConfig = {
  amount: {
    label: 'Revenue',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function ContributionHistory() {
  return (
    <Card className="max-w-md col-span-full sm:col-span-1 w-full">
      <CardHeader>
        <CardTitle>Sales Performance</CardTitle>
        <CardDescription>Last 6 months revenue</CardDescription>
        <CardAction>
          <Chip variant="filled">+18% vs last month</Chip>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
          >
            <XAxis dataKey="month" tickLine={false} tickMargin={8} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel className="min-w-40" />}
            />
            <Bar
              dataKey="amount"
              fill="var(--color-amount)"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
          <Item variant="default" className="flex-col items-stretch">
            <ItemContent className="gap-1">
              <ItemDescription className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                Next Target
              </ItemDescription>
              <span className="cn-font-heading text-lg font-semibold">June 30, 2024</span>
              <span className="text-sm text-muted-foreground">$10,000 goal</span>
            </ItemContent>
          </Item>
          <Item variant="default" className="flex-col items-stretch">
            <ItemContent className="gap-1">
              <ItemDescription className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                Growth Rate
              </ItemDescription>
              <span className="cn-font-heading text-lg font-semibold">On Track</span>
              <span className="text-sm text-muted-foreground">+24% YOY</span>
            </ItemContent>
          </Item>
        </div>
        <Button className="w-full">View Analytics</Button>
      </CardFooter>
    </Card>
  )
}
