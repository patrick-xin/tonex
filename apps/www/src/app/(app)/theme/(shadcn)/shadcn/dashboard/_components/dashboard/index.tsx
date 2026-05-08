import { SidebarInset, SidebarProvider } from '@/components/shadcn/sidebar'
import { AppSidebar } from './app-sidebar'
import { ChartAreaInteractive } from './chart-area-interactive'
import data from './data.json'
import { DataTable } from './data-table'
import { SectionCards } from './section-cards'
import { SiteHeader } from './site-header'

export default function ShadcnDashboard() {
  return (
    <div className="relative h-full">
      <SidebarProvider className="h-full min-h-full">
        <AppSidebar variant="inset" />
        <SidebarInset className="overflow-y-auto">
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2 min-h-0">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
                <DataTable data={data} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
