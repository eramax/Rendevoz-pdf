import { FC, PropsWithChildren, ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Content from '../Content'
const transition = {
  x: { type: 'spring', stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 }
}
const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }
  }
}
const SwitchAnimation: FC<{
  children: (switchWrapper: (children: ReactNode, key: string) => JSX.Element) => ReactNode
  direction: boolean
}> = ({ children, direction }) => {
  const switchWrapper = (children: ReactNode, key: string) => {
    return (
      <motion.div
        custom={direction}
        transition={transition}
        variants={variants}
        key={key}
        style={{ position: 'absolute', inset: 0 }}
        initial="enter"
        animate="center"
        exit="exit"
      >
        {children}
      </motion.div>
    )
  }
  return <AnimatePresence initial={false}>{children ? children(switchWrapper) : null}</AnimatePresence>
}

export default SwitchAnimation
