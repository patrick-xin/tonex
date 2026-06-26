import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '../section-header'
import { Terminal } from './terminal'
import { transcript } from './transcript'

export function IntergrationSection() {
  return (
    <section className="relative flex flex-col mx-auto py-12 sm:py-24 overflow-hidden px-4 md:px-12 lg:px-16">
      <SectionHeader
        heading="Agent-ready tokens, not agent-picked colors"
        description="Tonex gives it the commands, contrast checks, and target tokens to update your project without hand-picking colors."
      />
      <div className="mx-auto mb-8">
        <Button
          nativeButton={false}
          variant="secondary"
          className="px-8 h-10 text-base shadow-crisp!"
          render={<Link href="/docs/agent-skills/introduction" />}
        >
          Agent guide
          <ArrowRight className="ml-2 size-5" />
        </Button>
      </div>
      <Terminal transcript={transcript} />
    </section>
  )
}
