import type { NextConfig } from 'next'

const config: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS?.split(','),
}

export default config
