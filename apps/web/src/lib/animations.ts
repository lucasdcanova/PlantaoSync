import type { Variants, Transition } from 'framer-motion'

export const spring: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 28,
}

export const springFast: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 35,
}

export const ease: Transition = {
  type: 'tween',
  ease: [0.16, 1, 0.3, 1],
  duration: 0.4,
}

// Page transitions
export const pageVariants: Variants = {
  initial:  { opacity: 0, y: 16, scale: 0.99 },
  animate:  { opacity: 1, y: 0,  scale: 1,   transition: spring },
  exit:     { opacity: 0, y: -8, scale: 0.99, transition: { duration: 0.2 } },
}

// Stagger list
export const listVariants: Variants = {
  animate: { transition: { staggerChildren: 0.06 } },
}

// Card with stagger index
export const cardVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: spring },
}

// Fade in
export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
}

// Slide up
export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0,  transition: ease },
  exit:    { opacity: 0, y: 16, transition: { duration: 0.2 } },
}

// Slide from right (sidepanel)
export const slideRightVariants: Variants = {
  initial: { opacity: 0, x: 32  },
  animate: { opacity: 1, x: 0,   transition: ease },
  exit:    { opacity: 0, x: 32,  transition: { duration: 0.2 } },
}

// Scale in (modal/dialog)
export const scaleInVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1,    transition: springFast },
  exit:    { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
}

// Bottom sheet (mobile)
export const bottomSheetVariants: Variants = {
  initial: { y: '100%' },
  animate: { y: 0, transition: ease },
  exit:    { y: '100%', transition: { duration: 0.25, ease: [0.32, 0, 0.67, 0] } },
}

// Notification badge
export const badgePulse: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 600, damping: 20 } },
}

// Number counter (for KPIs)
export const counterVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { delay: 0.2, ...spring } },
}
