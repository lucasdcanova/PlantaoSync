'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { animate, motion, useMotionValue, type PanInfo } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export interface BottomNavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface BottomNavProps {
  items: BottomNavItem[]
  isActive?: (href: string) => boolean
}

const ORB_SIZE = 92

function clamp(value: number, min: number, max: number) {
  if (value < min) return min
  if (value > max) return max
  return value
}

function arraysAlmostEqual(a: number[], b: number[], epsilon = 0.5) {
  if (a.length !== b.length) return false
  return a.every((value, index) => Math.abs(value - b[index]) <= epsilon)
}

function findNearestIndex(value: number, positions: number[]) {
  if (positions.length === 0) return 0

  let nearestIndex = 0
  let nearestDistance = Math.abs(value - positions[0])

  for (let index = 1; index < positions.length; index += 1) {
    const distance = Math.abs(value - positions[index])
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestIndex = index
    }
  }

  return nearestIndex
}

export function BottomNav({ items, isActive: customIsActive }: BottomNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const navRef = useRef<HTMLElement | null>(null)
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const orbX = useMotionValue(0)

  const [slotCenters, setSlotCenters] = useState<number[]>([])
  const [navWidth, setNavWidth] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [orbOverrideIndex, setOrbOverrideIndex] = useState<number | null>(null)

  const isActive = useCallback(
    (href: string) => {
      if (customIsActive) return customIsActive(href)
      if (href === '/doctor') return pathname === href
      return pathname === href || pathname.startsWith(`${href}/`)
    },
    [customIsActive, pathname],
  )

  const activeIndex = useMemo(() => {
    const foundIndex = items.findIndex((item) => isActive(item.href))
    return foundIndex >= 0 ? foundIndex : 0
  }, [isActive, items])

  useEffect(() => {
    setOrbOverrideIndex(null)
  }, [activeIndex])

  const measureSlots = useCallback(() => {
    const navElement = navRef.current
    if (!navElement || items.length === 0) return

    const navRect = navElement.getBoundingClientRect()
    const fallbackSlotWidth = navRect.width / items.length

    const nextCenters = items.map((_, index) => {
      const itemElement = itemRefs.current[index]
      if (!itemElement) return fallbackSlotWidth * index + fallbackSlotWidth / 2

      const itemRect = itemElement.getBoundingClientRect()
      return itemRect.left - navRect.left + itemRect.width / 2
    })

    setNavWidth((previous) =>
      Math.abs(previous - navRect.width) <= 0.5 ? previous : navRect.width,
    )
    setSlotCenters((previous) =>
      arraysAlmostEqual(previous, nextCenters) ? previous : nextCenters,
    )
  }, [items])

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length)
    measureSlots()
    const rafId = window.requestAnimationFrame(measureSlots)

    const handleResize = () => measureSlots()
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [items.length, measureSlots, pathname])

  useEffect(() => {
    const navElement = navRef.current
    if (!navElement || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(() => measureSlots())
    observer.observe(navElement)

    return () => observer.disconnect()
  }, [measureSlots])

  const centers = useMemo(() => {
    if (slotCenters.length === items.length && items.length > 0) return slotCenters
    if (items.length === 0) return []

    const fallbackWidth = navWidth > 0 ? navWidth : items.length * 68
    const slotWidth = fallbackWidth / items.length
    return items.map((_, index) => slotWidth * index + slotWidth / 2)
  }, [items, navWidth, slotCenters])

  const orbDisplayIndex = useMemo(() => {
    const indexCandidate = dragging
      ? (previewIndex ?? activeIndex)
      : (orbOverrideIndex ?? activeIndex)
    return clamp(indexCandidate, 0, Math.max(items.length - 1, 0))
  }, [activeIndex, dragging, items.length, orbOverrideIndex, previewIndex])

  const minOrbX = centers.length > 0 ? centers[0] - ORB_SIZE / 2 : 0
  const maxOrbX = centers.length > 0 ? centers[centers.length - 1] - ORB_SIZE / 2 : 0

  const orbTargetX = useMemo(() => {
    const center = centers[orbDisplayIndex] ?? centers[0] ?? ORB_SIZE / 2
    return clamp(center - ORB_SIZE / 2, minOrbX, maxOrbX)
  }, [centers, maxOrbX, minOrbX, orbDisplayIndex])

  useEffect(() => {
    if (dragging) return

    const controls = animate(orbX, orbTargetX, {
      type: 'spring',
      stiffness: 460,
      damping: 34,
      mass: 0.9,
    })

    return () => {
      controls.stop()
    }
  }, [dragging, orbTargetX, orbX])

  const dragConstraints = useMemo(
    () => ({
      left: minOrbX,
      right: maxOrbX,
    }),
    [maxOrbX, minOrbX],
  )

  const updateNearestPreview = useCallback(
    (orbLeftX: number) => {
      if (centers.length === 0) return
      const nearestIndex = findNearestIndex(orbLeftX + ORB_SIZE / 2, centers)
      setPreviewIndex((current) => (current === nearestIndex ? current : nearestIndex))
    },
    [centers],
  )

  const handleDragStart = useCallback(() => {
    setDragging(true)
    setPreviewIndex(orbDisplayIndex)
  }, [orbDisplayIndex])

  const handleDrag = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, _info: PanInfo) => {
      const clampedX = clamp(orbX.get(), minOrbX, maxOrbX)
      if (Math.abs(clampedX - orbX.get()) > 0.5) {
        orbX.set(clampedX)
      }
      updateNearestPreview(clampedX)
    },
    [maxOrbX, minOrbX, orbX, updateNearestPreview],
  )

  const handleDragEnd = useCallback(() => {
    const clampedX = clamp(orbX.get(), minOrbX, maxOrbX)
    orbX.set(clampedX)

    const nearestIndex = findNearestIndex(clampedX + ORB_SIZE / 2, centers)
    const safeIndex = clamp(nearestIndex, 0, Math.max(items.length - 1, 0))
    const targetItem = items[safeIndex]

    setDragging(false)
    setPreviewIndex(null)

    if (!targetItem) return

    setOrbOverrideIndex(safeIndex)
    if (!isActive(targetItem.href)) {
      router.push(targetItem.href)
    }
  }, [centers, isActive, items, maxOrbX, minOrbX, orbX, router])

  if (items.length === 0) return null

  const orbItem = items[orbDisplayIndex] ?? items[0]
  const OrbIcon = orbItem.icon

  return (
    <nav ref={navRef} className="bottom-nav lg:hidden">
      <motion.div
        className={cn('bottom-nav-active-orb', dragging && 'dragging')}
        style={{ x: orbX }}
        drag="x"
        dragConstraints={dragConstraints}
        dragElastic={0.08}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.96 }}
      >
        <motion.div
          className="bottom-nav-inner bottom-nav-orb-inner"
          animate={{ scale: dragging ? 1.02 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
        >
          <OrbIcon className="bottom-nav-icon-v2 text-white" />
          <span className="bottom-nav-label-v2 whitespace-nowrap font-semibold text-white">
            {orbItem.label}
          </span>
        </motion.div>
      </motion.div>

      {items.map((item, index) => {
        const routeActive = isActive(item.href)
        const orbSelected = orbDisplayIndex === index
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={routeActive ? 'page' : undefined}
            ref={(node) => {
              itemRefs.current[index] = node
            }}
            className={cn(
              'bottom-nav-item-v2 tap-feedback',
              routeActive && 'route-active',
              orbSelected && 'orb-selected',
            )}
            onClick={() => {
              setOrbOverrideIndex(index)
            }}
          >
            <div className="bottom-nav-content-wrap">
              <motion.div
                className="bottom-nav-inner pointer-events-none"
                animate={{
                  opacity: orbSelected ? 0 : 1,
                  y: orbSelected ? 8 : 0,
                  scale: routeActive && !orbSelected ? 1.02 : 1,
                }}
                transition={{ duration: 0.22 }}
              >
                <Icon
                  className={cn(
                    'bottom-nav-icon-v2',
                    routeActive ? 'text-brand-700' : 'text-muted-foreground',
                  )}
                />
                <motion.span
                  className="bottom-nav-label-v2 whitespace-nowrap"
                  animate={{
                    color: routeActive ? 'var(--color-teal-dark)' : 'var(--color-text-muted)',
                    fontWeight: routeActive ? 600 : 500,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.span>
              </motion.div>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
