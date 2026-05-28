import { Brush, HomeIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="h-svh w-svw flex justify-center items-center px-4">
      <div>
        <h1 className="font-extrabold font-sans text-9xl mask-b-from-20% mask-b-to-90% text-center text-on-surface">
          404
        </h1>
        <p className="text-lg text-on-surface-variant text-balance text-center">
          The page you're looking for might have been moved or doesn't exist.
        </p>
        <div className="flex gap-4 w-full justify-center mt-6">
          <Button nativeButton={false} variant="outline" render={<Link href="/" />}>
            <HomeIcon />
            Go Home
          </Button>
          <Button nativeButton={false} render={<Link href="/theme" />}>
            <Brush />
            Theme Builder
          </Button>
        </div>
      </div>
    </main>
  )
}
