import { describe, expect, test } from 'vitest'
import { MODES } from '../mode'
import { previewCustomColor } from './custom-color'

describe('previewCustomColor', () => {
  test('returns 6-digit hex strings for all 4 roles in both modes', () => {
    const preview = previewCustomColor('#6750a4', { hex: '#22c55e', blend: true })
    const hexRe = /^#[0-9a-f]{6}$/
    for (const mode of MODES) {
      expect(preview[mode].color).toMatch(hexRe)
      expect(preview[mode].onColor).toMatch(hexRe)
      expect(preview[mode].colorContainer).toMatch(hexRe)
      expect(preview[mode].onColorContainer).toMatch(hexRe)
    }
  })

  test('blend=true and blend=false produce different output', () => {
    const blended = previewCustomColor('#6750a4', { hex: '#22c55e', blend: true })
    const raw = previewCustomColor('#6750a4', { hex: '#22c55e', blend: false })
    expect(blended.light.color).not.toBe(raw.light.color)
  })

  test('changing seed shifts blended output but not raw', () => {
    const a = previewCustomColor('#6750a4', { hex: '#22c55e', blend: true })
    const b = previewCustomColor('#ff0000', { hex: '#22c55e', blend: true })
    expect(a.light.color).not.toBe(b.light.color)

    const aRaw = previewCustomColor('#6750a4', { hex: '#22c55e', blend: false })
    const bRaw = previewCustomColor('#ff0000', { hex: '#22c55e', blend: false })
    expect(aRaw.light.color).toBe(bRaw.light.color)
  })
})
