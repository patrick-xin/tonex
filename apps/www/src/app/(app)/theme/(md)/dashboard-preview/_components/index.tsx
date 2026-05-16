'use client'

import type * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  createDialogHandle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChartMixedAxes } from './chart-mixed-axes'
import { DataTable } from './data-table'
import { KpiSparkGrid } from './kpi-card'

const dialogHandle = createDialogHandle<{
  title: string
  description: string
  icon: React.ReactNode
}>()

type DashboardContentProps = {
  showOnboarding?: boolean
}

export function DashboardContent({
  showOnboarding: _showOnboarding = true,
}: DashboardContentProps) {
  return (
    <div className="overflow-hidden">
      <div className="flex flex-col gap-4 xl:gap-6">
        <div className="h-120 2xl:h-150">
          <ChartMixedAxes />
        </div>
        <KpiSparkGrid />
        <DataTable />
      </div>
      <Dialog handle={dialogHandle}>
        {({ payload }) => {
          return (
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {payload?.icon}
                  {payload?.title}
                </DialogTitle>
                <DialogDescription>{payload?.description}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline">Close</Button>} />
              </DialogFooter>
            </DialogContent>
          )
        }}
      </Dialog>
    </div>
  )
}
