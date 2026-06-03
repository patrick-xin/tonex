'use client'

import { CarIcon, Coffee, MoreHorizontal, ShoppingCart, TvIcon, Wallet } from 'lucide-react'
import type * as React from 'react'
import { cn } from 'tailwind-variants'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/tables'

const TRANSACTIONS = [
  {
    id: 'coffee',
    icon: Coffee,
    name: 'Blue Bottle Coffee',
    category: 'Food & Drink',
    when: 'Today, 10:24 AM',
    amount: '-$6.50',
    income: false,
  },
  {
    id: 'groceries',
    icon: ShoppingCart,
    name: 'Whole Foods Market',
    category: 'Groceries',
    when: 'Yesterday',
    amount: '-$142.30',
    income: false,
  },
  {
    id: 'payout',
    icon: Wallet,
    name: 'Stripe Payout',
    category: 'Income',
    when: 'Oct 12',
    amount: '+$4,200.00',
    income: true,
  },
  {
    id: 'transport',
    icon: CarIcon,
    name: 'Uber Technologies',
    category: 'Transport',
    when: 'Oct 11',
    amount: '-$24.10',
    income: false,
  },
  {
    id: 'entertainment',
    icon: TvIcon,
    name: 'Netflix Subscription',
    category: 'Entertainment',
    when: 'Oct 10',
    amount: '-$19.99',
    income: false,
  },
]

export function RecentTransactions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <Card className={cn('w-full', className)} {...props}>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest account activity.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {TRANSACTIONS.map(({ id, icon: Icon, name, category, when, amount, income }) => (
              <TableRow key={id}>
                <TableCell className="w-10">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-surface-container-high">
                    <Icon className="size-4" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{name}</span>
                    <span className="text-sm text-on-surface-variant">{category}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-on-surface-variant">{when}</TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      income
                        ? 'text-sm font-semibold text-emerald-500 tabular-nums'
                        : 'text-sm font-semibold tabular-nums'
                    }
                  >
                    {amount}
                  </span>
                </TableCell>
                <TableCell className="w-8">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <MoreHorizontal />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>Add note</DropdownMenuItem>
                      <DropdownMenuItem>Categorize</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Dispute</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
