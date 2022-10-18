import React, { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type Animator = (children: ReactNode, key: string) => ReactNode

const animator: Animator = (children, key) => (
  <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    {children}
  </motion.div>
)

const useTransition = () => animator

export default useTransition
