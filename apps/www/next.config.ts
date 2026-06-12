import { createMDX } from 'fumadocs-mdx/next'
import type { NextConfig } from 'next'

const withMDX = createMDX({})

const config: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: '/docs/:path*.md',
        destination: '/llms.mdx/docs/:path*',
        permanent: true,
      },
    ]
  },
}

export default withMDX(config)
