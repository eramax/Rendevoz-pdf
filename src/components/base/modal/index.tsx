import { FC, MouseEvent, MouseEventHandler, ReactNode, useEffect, useRef, useState } from 'react'
import { Modal as ModalFC } from 'antd'
import styles from './index.module.less'
import { AnimatePresence, motion } from 'framer-motion'
import ReactDOM from 'react-dom'

interface ModalProps {
  visible: boolean
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  width?: number
  height?: number
  onClose: () => void
  onClick?: MouseEventHandler
  children: React.ReactNode
  parentElement?: HTMLElement | null
}
const Backdrop = ({ children, onMouseDown }) => {
  return (
    <motion.div
      onClick={e => {e.stopPropagation();console.log(e)}}
      className={styles.backdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={onMouseDown}
    >
      {children}
    </motion.div>
  )
}
const Modal: FC<ModalProps> = ({ visible, onClose, children, minWidth, minHeight, maxHeight, maxWidth, width, height, parentElement }) => {
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [visible])
  return ReactDOM.createPortal(
    <AnimatePresence>
      {visible && (
        <Backdrop onMouseDown={onClose}>
          <motion.div
            role="modal"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{ minWidth, minHeight, maxHeight, maxWidth, width, height }}
            className={styles.modal}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => {e.stopPropagation()}}
            transition={{ stiffness: 200, damping: 20 }}
          >
            {children}
          </motion.div>
        </Backdrop>
      )}
    </AnimatePresence>,
    parentElement || document.body
  )
}

export default Modal
