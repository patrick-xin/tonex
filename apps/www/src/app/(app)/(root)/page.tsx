// why: home page is intentionally lean — production UI hasn't been designed
// yet. All current testing surface lives at /sink. When the production flow
// lands, this file becomes its route shell; testbed stays at /sink as the

import Link from 'next/link'

// dev-only verification surface.
export default function Page() {
  return (
    <main className="grid gap-6 p-6 max-w-[960px]">
      <header>
        <h1 className="text-2xl font-semibold">tonex</h1>
        <p className="opacity-70 text-sm">logo → shadcn theme via material color utilities.</p>
      </header>
      <p className="text-sm">
        MD3{' '}
        <Link className="underline" href="/theme">
          /theme
        </Link>
        .
      </p>
      <p className="text-sm">
        Shadcn{' '}
        <Link className="underline" href="/theme/shadcn">
          /theme/shadcn
        </Link>
        .
      </p>
      <p className="text-sm">
        Testbed at{' '}
        <Link className="underline" href="/sink">
          /sink
        </Link>
        .
      </p>
    </main>
  )
}
