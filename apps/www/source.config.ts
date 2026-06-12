import { remarkCodeTab, remarkNpm } from 'fumadocs-core/mdx-plugins'
import { pageSchema } from 'fumadocs-core/source/schema'
import { defineConfig, defineDocs } from 'fumadocs-mdx/config'
import rehypePrettyCode from 'rehype-pretty-code'
import { z } from 'zod'

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [[remarkNpm, { persist: { id: 'package-manager' } }], remarkCodeTab],
    rehypePlugins: (plugins) => {
      plugins.shift()
      plugins.push([
        () =>
          rehypePrettyCode({
            theme: {
              dark: 'catppuccin-frappe',
              light: 'catppuccin-latte',
            },
          }),
      ])

      return plugins
    },
  },
})

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
    schema: pageSchema.extend({
      links: z
        .object({
          api: z.string().optional(),
          doc: z.string().optional(),
        })
        .optional(),
      status: z.enum(['planned', 'in-progress', 'new']).optional(),
    }),
  },
})
