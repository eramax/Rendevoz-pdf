import { useMousePositionRef } from '@/hooks'
import { cloneElement, forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useClickAway } from 'react-use'
import AnimatePopover from '../base/AnimatePopover'
import { ContextMenuContext, ContextMenuProvider } from './ContextMenuProvider'

export type Placement = 'top' | 'left' | 'right' | 'bottom'

interface ContextMenuProps {
  position?: Placement[]
  content: React.ReactNode
  children: React.ReactNode
  onContextMenu?: (elementX: number, elementY: number, relativeX: number, relativeY: number) => void
  closeOnChildrenClick?: boolean
}
export interface ContextMenuRef {
  closeContextMenu: () => void
}
const ContextMenu = forwardRef<ContextMenuRef, ContextMenuProps>(
  ({ position = ['right', 'left'], children, content, onContextMenu }, ref) => {
    const mousePos = useMousePositionRef()
    const [inContainerMousePos, setInContainerMousePos] = useState<ContextMenuContext>()
    const memoizedPosition = useRef<[number, number]>([0, 0])
    const childRef = useRef<HTMLElement | undefined>()
    const [contextMenuOpen, setContextMenuOpen] = useState(false)
    const contentRef = useRef<HTMLElement>()
    const handleRef = (node: HTMLElement) => {
      childRef.current = node
    }
    const closeContextMenu = () => {
      setContextMenuOpen(false)
    }
    useImperativeHandle(ref, () => ({ closeContextMenu }), [])
    const renderChild = () =>
      cloneElement(children as JSX.Element, {
        ref: handleRef
      })
    const renderContent = () => <ContextMenuProvider value={inContainerMousePos}>{content}</ContextMenuProvider>
    const handle = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (childRef.current) {
        const { left, top, width, height } = childRef.current.getBoundingClientRect()
        const eleX = e.pageX - left - window.scrollX
        const eleY = e.pageY - top - window.scrollY
        const relativeX = eleX / width
        const relativeY = eleY / height
        onContextMenu?.(eleX, eleY, relativeX, relativeY)
        setInContainerMousePos({
          docX: mousePos.current[0],
          docY: mousePos.current[1],
          eleX: eleX,
          eleY: eleY,
          relX: relativeX,
          relY: relativeY
        })
      }
      memoizedPosition.current = mousePos.current
      setContextMenuOpen(true)
    }
    useEffect(() => {
      childRef.current?.addEventListener('contextmenu', handle)
      return () => childRef.current?.removeEventListener('contextmenu', handle)
    })
    useClickAway(contentRef, () => {
      setContextMenuOpen(false)
    })
    return (
      <>
        <AnimatePopover
          align="start"
          positions={position}
          visible={contextMenuOpen}
          content={<div ref={contentRef}>{renderContent()}</div>}
        >
          <PosHelper top={memoizedPosition.current?.[1]} left={memoizedPosition.current?.[0]} />
        </AnimatePopover>
        {renderChild()}
      </>
    )
  }
)
interface PosHelperProps {
  top?: number
  left?: number
}
export const PosHelper = forwardRef<HTMLDivElement, PosHelperProps>(({ top, left }, ref) => {
  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: top,
        left: left
      }}
    ></div>,
    document.body
  )
})
export default memo(ContextMenu)
