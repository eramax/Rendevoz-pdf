import { useMemoizedFn } from '@/hooks'
import { useEffect, useRef, useState } from 'react'

const PanHelper = ({ containerEle, enablePan }: { containerEle?: HTMLElement; enablePan?: boolean }) => {
  const initialPositionRef = useRef({ top: 0, left: 0, x: 0, y: 0 })
  const handleMouseMove = useMemoizedFn((e: MouseEvent) => {
    if (!containerEle) {
      return
    }
    e.stopPropagation()
    e.preventDefault()
    const { top, left, x, y } = initialPositionRef.current
    containerEle.scrollTop = top - (e.clientY - y)
    containerEle.scrollLeft = left - (e.clientX - x)
  })

  const handleMouseDown = useMemoizedFn((e: MouseEvent) => {
    if (!containerEle) {
      return
    }
    e.preventDefault()
    e.stopPropagation()

    initialPositionRef.current = {
      left: containerEle.scrollLeft,
      top: containerEle.scrollTop,
      x: e.clientX,
      y: e.clientY
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  })

  const handleMouseUp = useMemoizedFn((e: MouseEvent) => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  })
  useEffect(() => {
    if (!containerEle) {
      return
    }

    if (enablePan) {
      containerEle.addEventListener('mousedown', handleMouseDown)
    }

    return () => {
      containerEle.removeEventListener('mousedown', handleMouseDown)
    }
  }, [enablePan])

  return enablePan ? <div style={{ zIndex: 9999, position: 'absolute', inset: 0, cursor: 'grab' }}></div> : null
}

export default PanHelper
