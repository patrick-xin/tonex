'use client'

import { getShaderNoiseTexture } from '@paper-design/shaders'
import { useEffect, useState } from 'react'

// why: Paper Shaders' React wrapper awaits string-URL uniforms but forwards
// HTMLImageElement uniforms straight through — and every shader that uses the
// built-in noise texture (god-rays, grain-gradient, smoke-ring, metaballs,
// voronoi, warp, halftone-cmyk, pulsing-border, dot-orbit, paper-texture)
// constructs `getShaderNoiseTexture()` synchronously during render with a
// fresh `new Image()`. On a cold cross-route mount the data URL has not
// decoded yet, so the vanilla ShaderMount constructor's `setTextureUniform`
// throws "image must be fully loaded".
//
// Probing the texture once at module scope warms the browser image cache;
// the cached promise then resolves synchronously on every subsequent mount.
// Consumers gate their `<Shader.../>` on `useShaderNoiseReady()` and the
// wrapper safely runs through `setTextureUniform` afterwards.

let noiseDecode: Promise<void> | null = null

export function ensureNoiseDecoded(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (noiseDecode) return noiseDecode
  noiseDecode = new Promise<void>((resolve) => {
    const img = getShaderNoiseTexture()
    if (!img) return resolve()
    if (img.complete && img.naturalWidth > 0) return resolve()
    const settle = () => resolve()
    img.addEventListener('load', settle, { once: true })
    img.addEventListener('error', settle, { once: true })
  })
  return noiseDecode
}

export function useShaderNoiseReady(): boolean {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let cancelled = false
    ensureNoiseDecoded().then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])
  return ready
}
