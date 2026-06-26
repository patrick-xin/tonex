import type { Metadata } from 'next'
import { TonePalettes } from './_color-palettes'

export const metadata: Metadata = {
  title: 'Tone Palettes',
  description: 'Tone palettes',
}

export default function PalettesPage() {
  return <TonePalettes />
}
