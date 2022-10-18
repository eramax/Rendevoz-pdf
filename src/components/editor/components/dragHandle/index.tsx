import { Noop } from '@/common/types'
import { Icon } from '@/components'
import { AnimatePresence, motion } from 'framer-motion'
import { FC, memo } from 'react'

type DragHandleProps = {
  left?: number
  top?: number
  targetHeight?: number
  targetId?: number
}

type IDragHandle = FC<
  DragHandleProps & {
    visible: boolean
    onMouseDown: Noop
    onClick: Noop
  }
>
const DragHandle: IDragHandle = ({ left, top, targetHeight, visible, onMouseDown, onClick }) => {
  return (
    <AnimatePresence>
      {targetHeight && visible && (
        <motion.div
          key={top}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onMouseDown}
          onClick={onClick}
          style={{
            cursor: 'grab',
            position: 'absolute',
            top: top,
            left: left,
            height: targetHeight,
            zIndex: 99
          }}
        >
          <div style={{ position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18 }}>
            <Icon size={18} name="park-drag" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default memo(DragHandle)