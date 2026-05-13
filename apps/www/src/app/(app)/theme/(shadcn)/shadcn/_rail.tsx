'use client'

import { usePathname } from 'next/navigation'
import { ShadcnPresetTunerRail } from '@/features/shadcn-preset-tuner'
import { ShadcnRail } from '@/features/shadcn-rail'

// why: /theme/shadcn/tuner is a dev-only sink for preset curation — it
// mounts the tuner rail instead of the production ShadcnRail. The two rails
// share no state surface, so picking is a pathname-level decision rather
// than something the rails themselves negotiate. Server layouts can't read
// pathname; this client component is the smallest seam.
export function ShadcnRailSwitcher() {
  const pathname = usePathname()
  const isTuner = pathname?.startsWith('/theme/shadcn/tuner') ?? false
  return isTuner ? <ShadcnPresetTunerRail /> : <ShadcnRail />
}
