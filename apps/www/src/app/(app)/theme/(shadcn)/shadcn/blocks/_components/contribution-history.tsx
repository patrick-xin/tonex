'use client'

import { Bar, BarChart, XAxis } from 'recharts'

import { Badge } from '@/components/shadcn/badge'
import { Button } from '@/components/shadcn/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/card'
import { Item, ItemContent, ItemDescription } from '@/components/shadcn/item'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const chartData = [
  { month: 'Dec', amount: 800 },
  { month: 'Jan', amount: 1100 },
  { month: 'Feb', amount: 900 },
  { month: 'Mar', amount: 1300 },
  { month: 'Apr', amount: 750 },
  { month: 'May', amount: 1400 },
]

const chartConfig = {
  amount: {
    label: 'Contribution',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function ContributionHistory() {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle>Contribution History</CardTitle>
        <CardDescription>Last 6 months of activity</CardDescription>
        <CardAction>
          <Badge variant="secondary">+12% vs last month</Badge>
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
          <Item variant="muted" className="flex-col items-stretch">
            <ItemContent className="gap-1">
              <ItemDescription className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                Upcoming
              </ItemDescription>
              <span className="cn-font-heading text-lg font-semibold">May 25, 2024</span>
              <span className="text-sm text-muted-foreground">$1,000 scheduled</span>
            </ItemContent>
          </Item>
          <Item variant="muted" className="flex-col items-stretch">
            <ItemContent className="gap-1">
              <ItemDescription className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                Auto-Save Plan
              </ItemDescription>
              <span className="cn-font-heading text-lg font-semibold">Accelerated</span>
              <span className="text-sm text-muted-foreground">Recurring weekly</span>
            </ItemContent>
          </Item>
        </div>
        <Button className="w-full">View Full Report</Button>
      </CardFooter>
    </Card>
  )
}
