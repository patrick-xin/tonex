import { GithubLogoIcon, TwitterLogoIcon } from '@phosphor-icons/react'
import { BookOpen, Home, LayoutGrid } from 'lucide-react'
import { MdIcon } from '@/components/icons/md'
import { ShadcnIcon } from '@/components/icons/shadcn'
import { TailwindCSSIcon } from '@/components/icons/tailwind'
import type { Item } from './_shortcuts'

export const links: Item[] = [
  { icon: Home, label: 'Home Page', value: 'home-page', href: '/' },
  { icon: LayoutGrid, label: 'Components', value: 'components', href: '/components' },
  { icon: BookOpen, label: 'Blog', value: 'blog', href: '/blog' },
  { icon: MdIcon, label: 'MD3 Builder', value: 'md3-builder', href: '/theme' },
  { icon: ShadcnIcon, label: 'Shadcn Builder', value: 'shadcn-builder', href: '/theme/shadcn' },
]

export const community: Item[] = [
  { icon: GithubLogoIcon, label: 'GitHub', value: 'github' },
  { icon: TwitterLogoIcon, label: 'Twitter', value: 'twitter' },
]

export const resources: Item[] = [
  {
    icon: MdIcon,
    label: 'Material Design',
    value: 'material-design',
    href: 'https://m3.material.io/',
  },
  { icon: ShadcnIcon, label: 'Shadcn', value: 'shadcn', href: 'https://ui.shadcn.com/' },
  {
    icon: TailwindCSSIcon,
    label: 'Tailwind CSS',
    value: 'tailwind-css',
    href: 'https://tailwindcss.com/',
  },
]
