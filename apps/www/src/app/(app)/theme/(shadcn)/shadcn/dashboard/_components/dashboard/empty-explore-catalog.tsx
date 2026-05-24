import { Button } from "@/components/shadcn/button"
import { Card, CardContent } from "@/components/shadcn/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/shadcn/empty"
import { AudioLinesIcon } from "lucide-react"


export function EmptyExploreCatalog() {
  return (
    <Card className="h-full w-full">
      <CardContent>
        <Empty className="p-4">
          <EmptyMedia variant="icon">
            <AudioLinesIcon
              
            />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Explore Catalog</EmptyTitle>
            <EmptyDescription>
              Check your ISRC codes, metadata, and visual assets before going
              live.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>View Catalog</Button>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  )
}
