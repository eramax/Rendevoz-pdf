import { EditorEventHandler, IndicatorChangeEvent } from '@/events/editorEvent'
import useEventEmitter from '@/events/useEventEmitter'
import { useMemoizedFn } from '@/hooks'
import { mergeRefs } from '@/hooks/utils/useMergedRef'
import useWhyDidYouUpdate from '@/hooks/utils/useWhyUpdate'
import classNames from 'classnames'
import { FC, memo, useRef, useState, CSSProperties, useEffect, cloneElement, useMemo } from 'react'
import { RenderElementProps } from 'slate-react'
import { CustomElement } from '../../customTypes'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './index.module.less'

type BlockProps = {
  blockId: number
  type: string
  ratio?: number
  isDragging?: boolean
  onMouseEnter?: (e: MouseEvent, element: CustomElement) => void
  element?: CustomElement
}
const Block: FC<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & BlockProps & RenderElementProps> = memo(
  ({ isDragging, blockId, children, ratio, type, attributes, element, onMouseEnter, ...rest }) => {
    const columnRef = useRef<HTMLDivElement>(null)
    const emitter = useEventEmitter()
    const handler = useMemo(() => new EditorEventHandler(), [])
    const [direction, setDirection] = useState<string>()
    const handleIndicatorChange = useMemoizedFn((data: IndicatorChangeEvent) => {
      const { direction, id } = data
      if (id === blockId) {
        setDirection(direction)
      } else {
        setDirection(undefined)
      }
    })
    handler.on('indicatorChange', handleIndicatorChange)
    const indicatorStyle: CSSProperties = {
      position: 'absolute',
      left: direction === 'left' ? -4 : direction === 'top' || direction === 'bottom' ? 0 : undefined,
      top: direction === 'top' ? -4 : direction === 'left' || direction === 'right' ? 0 : undefined,
      bottom: direction === 'bottom' ? -4 : direction === 'left' || direction === 'right' ? 0 : undefined,
      right: direction === 'right' ? -4 : direction === 'top' || direction === 'bottom' ? 0 : undefined,
      width: direction === 'right' || direction === 'left' ? 4 : undefined,
      height: direction === 'top' || direction === 'bottom' ? 4 : undefined,
      backgroundColor: '#8590ae',
      borderRadius: '3px'
    }
    useEffect(() => {
      emitter.addListener('editor', handler)
      return () => emitter.removeListener('editor', handler)
    }, [])
    useEffect(() => {
      const width = `calc(( 100% - ${
        46 * ((columnRef.current?.parentElement?.querySelectorAll("[data-type='column']").length || 2) - 1)
      }px ) * ${ratio?.toFixed(3)})`
      if(columnRef.current){
        columnRef.current.style.width = width
      }
    }, [ratio])
    const handleMouseEnter = (e: MouseEvent) => {
      onMouseEnter?.(e, element)
    }
    const renderChildren = () => (
      <div
        key={blockId}
        {...attributes}
        onMouseEnter={handleMouseEnter}
        {...rest}
        className={classNames(
          type === 'columnList' && styles.ColumnListBlock,
          type === 'column' && styles.ColumnBlock,
          type.startsWith('heading') && styles.HeadingBlock,
          type !== 'column' && type !== 'columnList' && !type.startsWith('heading') && styles.ParagraphBlock
        )}
      >
        {children}
        <AnimatePresence>
          {direction && (
            <motion.div
              transition={{ duration: 0.15 }}
              key={direction}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div style={indicatorStyle} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
    return type === 'column'
      ? cloneElement(
          <motion.div layout="position"></motion.div>,
          {
            ref: columnRef,
            style: {
              paddingTop: 12,
              paddingBottom: 12,
              flexGrow: 0,
              flexShrink: 0
            }
          },
          renderChildren()
        )
      : renderChildren()
  }
)

export default Block