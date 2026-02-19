import type { Transition, Variants } from 'framer-motion'

const easing: [number, number, number, number] = [0.4, 0, 0.2, 1]

export const motionFast: Transition = {
  type: 'tween',
  ease: easing,
  duration: 0.15,
}

export const motionBase: Transition = {
  type: 'tween',
  ease: easing,
  duration: 0.2,
}

export const motionSlow: Transition = {
  type: 'tween',
  ease: easing,
  duration: 0.28,
}

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: motionBase },
  exit: { opacity: 0, y: -6, transition: motionFast },
}

export const listVariants: Variants = {
  animate: { transition: { staggerChildren: 0.04 } },
}

export const cardVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: motionBase },
}

export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: motionBase },
}

export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: motionBase },
  exit: { opacity: 0, y: 8, transition: motionFast },
}

export const slideRightVariants: Variants = {
  initial: { opacity: 0, x: 18 },
  animate: { opacity: 1, x: 0, transition: motionBase },
  exit: { opacity: 0, x: 12, transition: motionFast },
}

export const scaleInVariants: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: motionBase },
  exit: { opacity: 0, scale: 0.98, transition: motionFast },
}

export const bottomSheetVariants: Variants = {
  initial: { y: '100%' },
  animate: { y: 0, transition: motionSlow },
  exit: { y: '100%', transition: motionBase },
}

export const badgePulse: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: motionBase },
}

export const counterVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { ...motionBase, delay: 0.08 } },
}
