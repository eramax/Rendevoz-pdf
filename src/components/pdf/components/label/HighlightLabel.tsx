import { Noop } from '@/common/types'
import { AnimatePopover, WithBorder } from '@/components'
import useEventEmitter from '@/events/useEventEmitter'
import { useMemoizedFn } from '@/hooks'
import { PrimitiveAtom, useAtom } from 'jotai'
import { FC, forwardRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useClickAway } from 'react-use'
import { IHighlightLabel } from '~/typings/data'
import LabelToolbar from '../toolbar/LabelToolbar'

interface HighlightLabelProps {
  highlightAtom: PrimitiveAtom<IHighlightLabel>
  onDelete: Noop
}
const layout = ['colorPicker', 'contentInput', 'addToEditorButton', 'separator', 'searcher', 'translator', 'separator', 'delete']

const HighlightLabel: FC<HighlightLabelProps> = ({ highlightAtom, onDelete }) => {
  const [highlight, setHighlight] = useAtom(highlightAtom)
  const [popoverVisible, setPopoverVisible] = useState(false)
  const highlightRef = useRef(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const emitter = useEventEmitter()
  useClickAway(highlightRef, e => {
    if (!toolbarRef.current?.contains(e.target)) {
      setPopoverVisible(false)
    }
  })

  const handleColorChange = useCallback((color: string) => {
    setHighlight({ ...highlight, color })
  }, [])
  const handleAddToEditor = useMemoizedFn(() => {
    emitter.emit('editor', {
      type: 'insertNode',
      data: {
        element: {
          type: 'highlight',
          originId: highlight.id,
          selectedText: highlight.selectedText,
          children: [{ text: '' }]
        }
      }
    })
  })

  return (
    <AnimatePopover
      padding={10}
      boundaryElement={document.body}
      visible={popoverVisible}
      positions={['top']}
      content={
        <WithBorder ref={toolbarRef} key={highlight.id}>
          <LabelToolbar
            layout={layout}
            key={highlight.id}
            onColorChange={handleColorChange}
            onDelete={onDelete}
            selectedText={highlight.selectedText}
            onAddToEditor={handleAddToEditor}
          />
        </WithBorder>
      }
    >
      <Highlights
        highlight={highlight}
        highlightRef={highlightRef}
        onClick={() => {
          setPopoverVisible(true)
        }}
        key={highlight.id}
      />
    </AnimatePopover>
  )
}
const Highlights = forwardRef((props, ref) => {
  const { highlight, onClick, highlightRef } = props
  return (
    <div
      key={highlight.id}
      style={{
        pointerEvents: 'all'
      }}
      ref={highlightRef}
      onClick={onClick}
    >
      {highlight.rects?.map((rect, idx) => (
        <div
          key={idx}
          ref={idx === 0 ? ref : undefined}
          style={{
            position: 'absolute',
            top: `${rect.percentageTop * 100}%`,
            left: `${rect.percentageLeft * 100}%`,
            width: `${rect.percentageWidth * 100}%`,
            height: `${rect.percentageHeight * 100}%`,
            backgroundColor: highlight.color,
            opacity: 0.3
          }}
        ></div>
      ))}
    </div>
  )
})
export default memo(HighlightLabel)
