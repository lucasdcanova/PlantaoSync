import Image from 'next/image'
import { cn } from '@/lib/utils'
import { BRAND_NAME } from '@/lib/brand'

type ProductLogoVariant = 'mark' | 'full'

interface ProductLogoProps {
  variant?: ProductLogoVariant
  className?: string
  imageClassName?: string
  priority?: boolean
}

const logoConfig: Record<ProductLogoVariant, { src: string; width: number; height: number }> = {
  mark: {
    src: '/brand/logo-mark.png',
    width: 120,
    height: 120,
  },
  full: {
    src: '/brand/logo-full.png',
    width: 640,
    height: 220,
  },
}

export function ProductLogo({
  variant = 'mark',
  className,
  imageClassName,
  priority = false,
}: ProductLogoProps) {
  const config = logoConfig[variant]

  return (
    <div className={cn('inline-flex items-center', className)}>
      <Image
        src={config.src}
        alt={BRAND_NAME}
        width={config.width}
        height={config.height}
        priority={priority}
        className={cn('h-auto w-full object-contain', imageClassName)}
      />
    </div>
  )
}
