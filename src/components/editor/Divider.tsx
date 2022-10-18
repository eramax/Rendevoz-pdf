import { useMemoizedFn } from '@/hooks'
import classNames from 'classnames'
import { PanInfo, motion, animate } from 'framer-motion'
import { FC, useRef, useState } from 'react'
import { Path } from 'slate'
import useIsDragging from './hooks/useIsDragging'
import styles from './index.module.less'

type DividerProps = {
  onDragStart: () => void
  onDragEnd: (previousColumnWidthRatio: number, previousColumnPath: Path, nextColumnWidthRatio: number, nextColumnPath: Path) => void
  currentPath: Path
}
const Divider: FC<DividerProps> = ({ onDragEnd, onDragStart, currentPath }) => {
  const [isDragging] = useIsDragging()
  const dividerRef = useRef<HTMLDivElement>(null)
  const widthRef = useRef(null)
  const [isDraggingHandle, setIsDraggingHandle] = useState(false)
  const prevPrevColumnAnim = useRef()
  const prevNextColumnAnim = useRef()
  const handleDragStart = (e: MouseEvent) => {
    if (isDragging) return
    setIsDraggingHandle(true)
    onDragStart?.()
    const divider = dividerRef.current
    if (divider) {
      const previousColumn = divider.previousElementSibling
      const nextColumn = divider.nextElementSibling
      widthRef.current = {
        previousColumnWidth: previousColumn?.getBoundingClientRect().width,
        nextColumnWidth: nextColumn?.getBoundingClientRect().width
      }
    }
  }
  const handleDrag = (e: MouseEvent, info: PanInfo) => {
    const { x: dx, y: dy } = info.offset
    const divider = dividerRef.current
    if (divider && widthRef.current) {
      if (widthRef.current.previousColumnWidth + dx < 50 || widthRef.current.nextColumnWidth - dx < 50) {
        return
      }
      const previousColumn = divider.previousElementSibling as HTMLElement
      prevPrevColumnAnim.current?.stop()
      const s = animate(previousColumn.clientWidth, widthRef.current.previousColumnWidth + dx, {
        onUpdate: w => (previousColumn.style.width = `${w}px`),
        duration: 0.03,
        type: 'keyframes'
      })
      prevPrevColumnAnim.current = s
      prevNextColumnAnim.current?.stop()
      const nextColumn = divider.nextElementSibling as HTMLElement
      const b = animate(nextColumn.clientWidth, widthRef.current.nextColumnWidth - dx, {
        onUpdate: w => (nextColumn.style.width = `${w}px`),
        duration: 0.03,
        type: 'keyframes'
      })
      prevNextColumnAnim.current = b
    }
  }
  const handleDragEnd = useMemoizedFn((e: MouseEvent) => {
    widthRef.current = undefined
    prevNextColumnAnim.current.stop()
    prevPrevColumnAnim.current.stop()
    setIsDraggingHandle(false)
    const divider = dividerRef.current
    if (divider) {
      const previousColumn = divider.previousElementSibling as HTMLElement
      const previousColumnWidth = previousColumn.clientWidth
      const nextColumn = divider.nextElementSibling as HTMLElement
      const nextColumnWidth = nextColumn.clientWidth
      const allColumnsWidth = Array.from(divider.parentElement?.querySelectorAll("[data-type='column']") || []).reduce((prev, curr) => {
        return prev + curr.getBoundingClientRect().width
      }, 0)
      const previousColumnWidthRatio = previousColumnWidth / allColumnsWidth
      const nextColumnWidthRatio = nextColumnWidth / allColumnsWidth
      onDragEnd(previousColumnWidthRatio, Path.previous(currentPath), nextColumnWidthRatio, currentPath)
    }
  })
  return (
    <>
      <motion.div
        drag="x"
        onDragEnd={handleDragEnd}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        ref={dividerRef}
        whileHover={{ opacity: 1, cursor: 'col-resize' }}
        style={{ opacity: isDraggingHandle ? 1 : undefined, pointerEvents: isDraggingHandle ? 'all' : isDragging ? 'none' : undefined }}
        contentEditable={false}
        className={classNames(styles.DividerWrapper)}
        transition={{ duration: 0.1 }}
      >
        <motion.div className={styles.Divider}></motion.div>
      </motion.div>
    </>
  )
}
export default Divider
