import { useEffect, useState } from 'react'

export function useScrollToTop({ top = 20 }: { top?: number } = {}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(document.documentElement.scrollTop >= top)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [top])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return { visible, scrollToTop }
}
