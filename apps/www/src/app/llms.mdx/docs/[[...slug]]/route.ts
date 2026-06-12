import { notFound } from 'next/navigation'
import { getLLMText } from '@/features/docs/utils/get-llm-text'
import { source } from '@/features/docs/utils/source'

export async function GET(_req: Request, { params }: RouteContext<'/llms.mdx/docs/[[...slug]]'>) {
  const { slug } = await params

  const page = source.getPage(slug)

  if (!page) notFound()

  return new Response(await getLLMText(page), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  })
}

export function generateStaticParams() {
  return source.generateParams()
}
