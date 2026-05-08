'use client'

import { toast } from 'sonner'

import { Button } from '@/components/shadcn/button'

export function SonnerDemo() {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast('Event has been created', {
            description: 'Sunday, December 03, 2023 at 9:00 AM',
            action: {
              label: 'Undo',
              onClick: () => console.log('Undo'),
            },
          })
        }
      >
        Show Toast
      </Button>
      <Button
        onClick={() =>
          toast('Event has been created', {
            description: 'Monday, January 3rd at 6:00pm',
          })
        }
        variant="outline"
        className="w-fit"
      >
        Show Toast With Description
      </Button>
    </div>
  )
}
