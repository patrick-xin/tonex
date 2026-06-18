import Link from 'next/link'
import type React from 'react'

interface CardContentProps {
  icon?: React.ReactNode
  title: string
  description?: string
}

const CardContent: React.FC<CardContentProps> = ({ icon, title, description }) => (
  <>
    {icon && (
      <span className="rounded-md bg-secondary-container p-2 text-on-secondary-container">
        {icon}
      </span>
    )}
    <div className="space-y-4">
      <div className="font-semibold text-base">{title}</div>
      {description && <p className="text-on-surface-variant text-sm">{description}</p>}
    </div>
  </>
)

export interface DocCardProps extends CardContentProps {
  href?: string
}

export function DocCard({ title, description, icon, href }: DocCardProps) {
  const className =
    'not-prose flex-1 border border-outline-variant p-4 md:p-6 flex rounded-md flex-col items-start space-y-6 hover:border-primary/60 transition-colors ease-linear focus-state'

  if (href) {
    return (
      <Link className={className} href={href}>
        <CardContent description={description} icon={icon} title={title} />
      </Link>
    )
  }

  return (
    <div className={className}>
      <CardContent description={description} icon={icon} title={title} />
    </div>
  )
}
