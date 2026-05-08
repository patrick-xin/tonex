import { usePathname } from 'next/navigation'

export function useThemePath() {
  const pathname = usePathname()
  const isShadcn = pathname.startsWith('/theme/shadcn')
  const isMD3 = !isShadcn && pathname.startsWith('/theme')

  return {
    isShadcn,
    isMD3,
  }
}
