/**
 * Animation hooks and utilities for motion.dev
 * Use these with motion.div, motion.button, etc.
 */

export function useMotionAnimation(variant: string) {
  // Hook to manage motion animations
  // Can be expanded to track animation state
  return {
    variant,
    animate: 'visible',
    initial: 'hidden',
  }
}

export function useStaggerAnimation(itemCount: number, delay: number = 0.1) {
  return {
    variants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: delay,
          delayChildren: 0.1 * itemCount,
        },
      },
    },
  }
}
