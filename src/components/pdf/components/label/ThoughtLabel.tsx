import { Icon, ReadMore, WithBorder } from '@/components'
import AnimatePopover from '@/components/base/AnimatePopover'
import { PdfEventHandler } from '@/events/pdfEvent'
import useEventEmitter from '@/events/useEventEmitter'
import { useToggle } from '@/hooks'
import { CSSProperties, FC, memo, RefObject, useLayoutEffect, useRef, useState } from 'react'
import { Rnd } from 'react-rnd'
import { IThoughtLabel } from '~/typings/data'
import LabelToolbar from '../toolbar/LabelToolbar'
import { motion, AnimatePresence } from 'framer-motion'
import { PrimitiveAtom, useAtom } from 'jotai'
interface ThoughtLabelProps {
  thoughtAtom: PrimitiveAtom<IThoughtLabel>
  onDelete: () => void
  dragBoundRef: RefObject<HTMLDivElement>
}

const positions = ['top', 'right', 'bottom', 'left']
const ThoughtLabel: FC<ThoughtLabelProps> = ({ thoughtAtom, onDelete, dragBoundRef }) => {
  const [thought, setThought] = useAtom(thoughtAtom)
  const { id, color, icon, content, rect } = thought
  const ref = useRef<HTMLDivElement>(null)
  const divRef = useRef(null)
  const [toolbarVisible, setToolbarVisible] = useState(false)
  const [movable, toggleMovable] = useToggle(false)
  const [position, setPosition] = useState()
  const isDragging = useRef(false)
  const emitter = useEventEmitter()
  const handler = new PdfEventHandler()
  handler.on('addThought', data => {
    const thoughtId = data.id
    if (Object.is(id, thoughtId)) {
      setToolbarVisible(true)
    }
  })
  useLayoutEffect(() => {
    emitter.addListener('pdf', handler)
    return () => emitter.removeListener('pdf', handler)
  }, [])
  const renderIcon = () => {
    return (
      <div
        ref={divRef}
        style={{
          position: 'absolute',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'auto'
        }}
      >
        <AnimatePresence>
          {!toolbarVisible && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderContent()}
            </motion.div>
          )}
        </AnimatePresence>
        <Icon
          style={{ color: color }}
          cursor="pointer"
          onClick={() => {
            isDragging.current === false && setToolbarVisible(!toolbarVisible)
          }}
          name={icon || 'park-info'}
        />
      </div>
    )
  }
  const renderToobar = () => {
    return (
      <WithBorder borderRadius={5}>
        <LabelToolbar
          onDelete={onDelete}
          movable={movable}
          content={content}
          onDirectionChange={() => {
            const currentPosition = thought.position
            let nextPosition = 'right'
            if (currentPosition) {
              const idx = positions.findIndex(i => i === currentPosition)
              idx === positions.length - 1 ? (nextPosition = positions[0]) : (nextPosition = positions[idx + 1])
            }
            setThought({
              ...thought,
              position: nextPosition
            })
          }}
          onContentChange={value => {
            setThought({ ...thought, content: value })
            emitter.emit('editor', {
              type: 'outerElementPropertyChange',
              data: {
                element: {
                  originId: id,
                  title: value
                }
              }
            })
          }}
          onMovableChange={() => toggleMovable()}
          onIconChange={i => setThought({ ...thought, icon: i })}
          color={color}
          onColorChange={c => setThought({ ...thought, color: c })}
          onAddToEditor={() => {
            emitter.emit('editor', {
              type: 'insertNode',
              data: {
                element: {
                  type: 'thought',
                  originId: id,
                  title: thought.content || 'No title thought',
                  content: '',
                  children: [
                    {
                      text: ''
                    }
                  ]
                }
              }
            })
          }}
        />
      </WithBorder>
    )
  }
  const getPosition = (): CSSProperties => {
    switch (thought.position) {
      default:
      case 'top':
        return {
          transform: 'translateX(-50%) translateY(-100%)',
          top: '-10px',
          left: '50%'
        }
      case 'bottom':
        return {
          transform: 'translateX(-50%) translateY(100%)',
          bottom: '-10px',
          left: '50%'
        }
      case 'left':
        return {
          transform: 'translateX(-100%) translateY(-50%)',
          left: '-10px',
          top: '50%'
        }
      case 'right':
        return {
          transform: 'translateX(100%) translateY(-50%)',
          right: '-10px',
          top: '50%'
        }
    }
  }
  const renderContent = () => {
    const positionDetails = getPosition()
    return (
      <WithBorder
        borderRadius={5}
        style={{
          maxWidth: '300px',
          width: 'max-content',
          position: 'absolute',
          padding: '4px 6px',
          ...positionDetails
        }}
      >
        <ReadMore style={{ color: thought.color }} textLength={100}>
          {(content && content !== '' && content) || 'No thought yet'}
        </ReadMore>
      </WithBorder>
    )
  }
  const renderPopover = () => {
    return (
      <AnimatePopover
        padding={10}
        reposition={false}
        boundaryElement={document.body}
        onClickOutside={() => setToolbarVisible(false)}
        visible={toolbarVisible}
        positions={['top']}
        content={renderToobar()}
      >
        {renderIcon()}
      </AnimatePopover>
    )
  }

  return (
    <motion.div
      initial={{ left: `${rect[0]}%`, top: `${rect[1]}%` }}
      drag={movable}
      style={{ position: 'absolute' }}
      dragConstraints={dragBoundRef}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={e => (isDragging.current = true)}
      onDragEnd={(e, info) => {
        setTimeout(() => {
          isDragging.current = false
        }, 100)
        const { point } = info
        const bound = dragBoundRef.current?.getBoundingClientRect()
        const relX = point.x - bound?.x
        const relY = point.y - bound?.y
        setThought({
          ...thought,
          rect: [(relX / bound.width) * 100, (relY / bound.height) * 100]
        })
      }}
    >
      {renderPopover()}
    </motion.div>
    // <Rnd
    //   bounds="parent"
    //   ref={ref}
    //   enableResizing={false}
    //   disableDragging={!movable}
    //   position={position}
    //   onDragStop={() => {
    //     setTimeout(() => {
    //       isDragging.current = false
    //     }, 100)
    //   }}
    //   onDrag={(e, data) => {
    //     e.stopPropagation()
    //     if (!isDragging.current) {
    //       isDragging.current = true
    //     }
    //     setPosition({ x: data.x, y: data.y })
    //   }}
    // >
    //   {renderPopover()}
    // </Rnd>
  )
}

export default memo(ThoughtLabel)
