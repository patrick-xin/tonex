import { Loader2 } from 'lucide-react'

export const DemoLoader = () => {
  return (
    <div className="flex w-full items-center justify-center min-h-[calc(100vh-6rem)]">
      <Loader2 className="size-6 text-on-surface-variant animate-spin" />
    </div>
  )
}
