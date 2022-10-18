import { ReactNode } from 'react'
import { motion } from 'framer-motion'
// only fade tranisition right now
const TransitionRoute = ({ children, type = 'fade' }: { children: ReactNode; type?: 'fade' }) => {
  return (
    <motion.div style={{height: '100%',width: '100%'}} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {children}
    </motion.div>
  )
}

export default TransitionRoute
