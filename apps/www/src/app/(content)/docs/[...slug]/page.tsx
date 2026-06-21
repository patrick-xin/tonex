import { findNeighbour } from 'fumadocs-core/page-tree'
import { cacheLife } from 'next/cache'
import { notFound } from 'next/navigation'
import { DocsActions } from '@/features/docs/docs-actions'
import { DocsArticleFooter } from '@/features/docs/docs-article-footer'
import { DocsToc } from '@/features/docs/layout'
import { mdxComponents } from '@/features/docs/mdx'
import { source } from '@/features/docs/utils/source'

export function generateStaticParams() {
  return source.generateParams().map((param) => ({
    slug: param.slug,
  }))
}

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) {
    notFound()
  }
  const doc = page.data
  if (!doc.title || !doc.description) {
    notFound()
  }
  return {
    description: doc.description,
    title: doc.title,
  }
}

export default async function DocsPage({ params }: { params: Promise<{ slug: string[] }> }) {
  'use cache'
  cacheLife('max')
  const { slug } = await params
  const page = source.getPage(slug)
  if (!page) {
    notFound()
  }
  const doc = page.data
  const MDX = doc.body
  const tree = source.getPageTree()

  const neighbours = findNeighbour(tree, page.url, {
    separateRoot: true,
  })
  return (
    <div className="flex items-start">
      <div className="flex-1 min-w-0">
        <div className="min-w-0 px-4 py-6">
          <div className="prose prose-tonex 2xl:prose-lg mx-auto min-w-0 w-full prose-h2:scroll-mt-6 prose-h3:scroll-mt-6">
            <div className="border-b border-outline-variant">
              <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:justify-between sm:items-center">
                <h1 className="not-prose text-3xl xl:text-4xl font-bold">{doc.title}</h1>
                <div className="flex items-center gap-2">
                  <DocsActions slug={slug} url={page.url} />
                </div>
              </div>
              <p className="my-4 text-on-surface-variant">{doc.description}</p>
            </div>
            <article>
              <MDX components={mdxComponents} />
            </article>
            <DocsArticleFooter neighbours={neighbours} />
          </div>
        </div>
      </div>
      <div className="hidden xl:block w-(--toc-width) shrink-0 sticky top-12 self-start">
        <DocsToc items={page.data.toc} />
      </div>
    </div>
  )
}
