import type { NextConfig } from 'next'

const config: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  allowedDevOrigins: ['192.168.0.102'],
}

export default config
