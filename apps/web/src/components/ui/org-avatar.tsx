'use client'

import { cn, getInitials } from '@/lib/utils'

interface OrgAvatarProps {
  name: string
  logoUrl?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  xs: { container: 'h-6 w-6 rounded-md text-[9px]' },
  sm: { container: 'h-8 w-8 rounded-lg text-[10px]' },
  md: { container: 'h-10 w-10 rounded-xl text-xs' },
  lg: { container: 'h-20 w-20 rounded-2xl text-xl' },
}

export function OrgAvatar({ name, logoUrl, size = 'md', className }: OrgAvatarProps) {
  const { container } = sizeMap[size]

  if (logoUrl) {
    return (
      <div className={cn('shrink-0 overflow-hidden border border-border/40', container, className)}>
        <img src={logoUrl} alt={name} className="h-full w-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'shrink-0 flex items-center justify-center font-bold',
        'bg-brand-600 text-white',
        container,
        className,
      )}
    >
      {getInitials(name).slice(0, 2)}
    </div>
  )
}
