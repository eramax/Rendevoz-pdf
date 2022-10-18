import { Children, cloneElement, FC, forwardRef, PropsWithChildren, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

interface ToolTipProps {
  content: string | ReactNode
}

const ToolTip: FC<PropsWithChildren<ToolTipProps>> = ({ content, children }, ref) => {
  const [open, setOpen] = useState(false)
  const [bound, setBound] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })
  useEffect(() => {
    return () => console.log('unmkount')
  }, [open])
  const childRef = useRef<HTMLElement>(null)
  const handleChildRef = useCallback(
    (node: HTMLElement) => {
      childRef.current = node
      if (ref != null) {
        if (typeof ref === 'object') {
          ref.current = node
        } else if (typeof ref === 'function') {
          ref(node)
        }
      }
    },
    [ref]
  )
  const handleMouseEvent = (e: MouseEvent) => {
    if (e.type === 'click') {
      setOpen(false)
    }
    if (e.type === 'mouseenter') {
      setOpen(true)
      const rect = e.target.getBoundingClientRect()
      const { scrollTop, scrollLeft } = document.body
      setBound({ x: rect.left + scrollLeft, y: rect.top + scrollTop, width: rect.width, height: rect.height })
    }
    if (e.type === 'mouseleave') {
      setOpen(false)
    }
  }
  useEffect(() => {
    const child = childRef.current
    if (child) {
      child.addEventListener('click', handleMouseEvent)
      child.addEventListener('mouseenter', handleMouseEvent)
      child.addEventListener('mouseleave', handleMouseEvent)
    }
    return () => {
      child?.addEventListener('click', handleMouseEvent)
      child?.removeEventListener('mouseenter', handleMouseEvent)
      child?.removeEventListener('mouseleave', handleMouseEvent)
    }
  }, [childRef])
  const renderChild = () =>
    cloneElement(children as JSX.Element, {
      ref: handleChildRef
    })

  return (
    <>
      {renderChild()}
      <AnimatePresence>{open && content && <ToolTipPopover bound={bound} children={content} />}</AnimatePresence>
    </>
  )
}
const ToolTipInner = ({ children, bound }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      left: bound.x + bound.width / 2,
      top: bound.y,
      pointerEvents: 'none',
      transform: `translate3d(-50%,${bound.height + 10}px,0)`,
      background: 'rgba(0,0,0,0.6)',
      color: 'white',
      borderRadius: 4,
      lineHeight: 1.2,
      padding: '2px 4px 4px',
      position: 'absolute',
      zIndex: 1000
    }}
  >
    {children}
  </motion.div>
)
const ToolTipPopover = ({ children, bound }) => {
  return createPortal(<ToolTipInner bound={bound}>{children}</ToolTipInner>, document.body)
}
export default forwardRef(ToolTip)
