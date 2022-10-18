import { Box, SelectionBox } from '@/components/dragSelector'
import React, { useCallback, useRef, useState } from 'react'
import DragSelection from './mouseSelection'
import html2canvas from 'html2canvas'
import { PdfLabelsAtoms, usePdfLabels, usePdfNote } from '../../hooks/usePdfNote'
import ContextMenu, { ContextMenuRef } from '@/components/contextMenu'
import PdfContextMenu from '@/components/menus/PdfContextMenu'
import ThoughtLabel from '../label/ThoughtLabel'
import { WithBorder } from '@/components'
import { useIntersection, useIsomorphicLayoutEffect } from 'react-use'
import { RenderPageProps } from '@/pdfViewer/core/types'
import styles from './index.module.less'
import { AnimatePopover } from '@/components'
import { PdfEventHandler, TextSelectEvent } from '@/events/pdfEvent'
import useEventEmitter from '@/events/useEventEmitter'
import TextSelectionToolbar from '../toolbar/TextSelectionToolbar'
import Id from '@/utils/id'
import HighlightLabel from '../label/HighlightLabel'
import { useTime } from '@/hooks'
import { useAtomValue } from 'jotai'
import useCleanMode from '../../hooks/useCleanMode'
import PdfViewerToolMenu from '@/components/menus/PdfViewerToolMenu'

interface PdfPageProps extends RenderPageProps {
  onCanvasLayerClick?: (e: React.MouseEvent) => void
  onCanvasLayerDrag?: (e: SelectionBox) => void
  onCanvasLayerDragEnd?: (e: string | undefined) => void
  onTextSelectionClick?: (e: ITextSelectionLabel) => void
  enableCrop?: boolean
  textLayerVisible?: boolean
}

const PdfPage: React.FC<PdfPageProps> = ({
  enableCrop,
  textLayerVisible,
  onCanvasLayerDrag,
  onCanvasLayerDragEnd,
  pageIndex,
  textLayer,
  canvasLayer,
  annotationLayer,
  onCanvasLayerClick,
  onTextSelectionClick
}) => {
  const thisRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<Box>()
  const labelContainerRef = useRef<HTMLDivElement>(null)
  const contextMenuRef = useRef<ContextMenuRef>(null)
  const pdfLabels = useAtomValue(PdfLabelsAtoms)
  const [cleanMode] = useCleanMode()
  const [pdfNote] = usePdfNote()
  const [thoughts, dispatchThoughts] = usePdfLabels(pageIndex, 'thought')
  const [highlights, dispatchHighlights] = usePdfLabels(pageIndex, 'highlight')
  const [popoverVisible, setPopoverVisible] = useState(false)
  const [textSelectionToolbarVisible, setTextSelectionToolbarVisible] = useState(false)
  const intersection = useIntersection(thisRef, { root: null, rootMargin: '1px', threshold: 0 })
  const emitter = useEventEmitter()
  const handler = new PdfEventHandler()
  const [textSelect, setTextSelect] = useState<TextSelectEvent>()
  useIsomorphicLayoutEffect(() => {
    emitter.addListener('pdf', handler)
    return () => emitter.removeListener('pdf', handler)
  }, [])
  handler.on('textSelect', data => {
    if (data.pageIndex === pageIndex) {
      if (data.isCancel) {
        setTextSelectionToolbarVisible(false)
      } else {
        setTextSelect(data)
        setTextSelectionToolbarVisible(true)
      }
    }
  })

  const handleSelectionChange = useCallback((box: Box) => {
    onCanvasLayerDrag(box)
    boxRef.current = box
    console.log(box)
  }, [])
  const handleSelectionEnd = useCallback(() => {
    if (thisRef.current && enableCrop) {
      html2canvas(thisRef.current).then(canvas => {
        const newCanvas = document.createElement('canvas')
        newCanvas.height = thisRef.current.clientHeight
        newCanvas.width = thisRef.current.clientWidth
        const newCanvasContext = newCanvas.getContext('2d')
        newCanvasContext?.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, newCanvas.width, newCanvas.height)
        const croppedCanvas = document.createElement('canvas')
        const croppedCanvasContext = croppedCanvas.getContext('2d')
        const { left, top, height, width } = boxRef.current
        croppedCanvas.width = width
        croppedCanvas.height = height
        if (croppedCanvasContext) {
          croppedCanvasContext.drawImage(newCanvas, left, top, width, height, 0, 0, width, height)
        }
        if (croppedCanvas) {
          const url = croppedCanvas.toDataURL()
          onCanvasLayerDragEnd(url)
        }
      })
    }
    onCanvasLayerDragEnd(undefined)
  }, [enableCrop])

  return (
    <>
      {thisRef.current && (
        <DragSelection onSelectionEnd={handleSelectionEnd} onSelectionChange={handleSelectionChange} eventsElement={thisRef.current} />
      )}
      <div
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        ref={thisRef}
        onClick={e => {
          onCanvasLayerClick(e)
        }}
      >
        {canvasLayer}
      </div>
      {textLayerVisible && (
        <ContextMenu
          ref={contextMenuRef}
          content={
            <WithBorder borderRadius={5} style={{ backgroundColor: 'white' }}>
              <PdfContextMenu
                onAddThought={mousePos => {
                  const id = Id.getId()
                  console.log(pdfLabels.length)
                  dispatchThoughts({
                    type: 'insert',
                    value: {
                      id: id,
                      type: 'thought',
                      page: pageIndex,
                      rect: [mousePos.relX * 100, mousePos.relY * 100],
                      targetNotesDesitinations: new Map(),
                      content: '',
                      createTime: useTime(),
                      modifyTime: useTime()
                    }
                  })
                  setTimeout(() => {
                    emitter.emit('pdf', { type: 'addThought', data: { id: id } })
                  }, 0)
                }}
                onShouldCloseContextMenu={() => contextMenuRef.current?.closeContextMenu()}
              />
            </WithBorder>
          }
        >
          <div
            style={{ position: 'absolute', width: '100%', height: '100%' }}
            onClick={() => {
              if (popoverVisible) {
                setPopoverVisible(false)
              }
            }}
          >
            {textLayer}
          </div>
        </ContextMenu>
      )}
      {annotationLayer}
      <div
        style={{
          width: '100%',
          height: '100%',
          left: 0,
          position: 'absolute',
          top: 0,
          zIndex: 999,
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            pointerEvents: 'none'
          }}
          ref={labelContainerRef}
        >
          {intersection?.isIntersecting && !cleanMode && (
            <>
              {thoughts?.map(i => (
                <ThoughtLabel
                  key={`${i.toString()}`}
                  thoughtAtom={i}
                  dragBoundRef={labelContainerRef}
                  onDelete={() => {
                    dispatchThoughts({ type: 'remove', atom: i })
                  }}
                />
              ))}
              {highlights.map(i => (
                <HighlightLabel key={`${i}`} highlightAtom={i} onDelete={() => dispatchHighlights({ type: 'remove', atom: i })} />
              ))}
            </>
          )}
        </div>
      </div>
      <AnimatePopover
        padding={10}
        visible={textSelectionToolbarVisible}
        containerStyle={{ zIndex: 9999 }}
        content={
          <WithBorder>
            <TextSelectionToolbar
              onHighlight={color => {
                setTextSelectionToolbarVisible(false)
                emitter.emit('pdf', { type: 'cancelTextSelect' })
                dispatchHighlights({
                  type: 'insert',
                  value: {
                    page: textSelect?.pageIndex,
                    selectedText: textSelect?.selectedText,
                    type: 'highlight',
                    id: Id.getId(),
                    color,
                    createTime: useTime(),
                    modifyTime: useTime(),
                    rects: textSelect?.rects?.map(r => ({
                      percentageTop: r.percentageTop,
                      percentageHeight: r.percentageHeight,
                      percentageLeft: r.percentageLeft,
                      percentageWidth: r.percentageWidth
                    }))
                  }
                })
              }}
              textSelect={textSelect}
            />
          </WithBorder>
        }
      >
        <div
          data-label="text-selection-position-helper"
          style={{
            left: (textSelect && textSelect.rects[0]?.left + textSelect.rects[0]?.width / 2) || 0,
            top: textSelect?.rects[0]?.top || 0,
            position: 'absolute'
          }}
        ></div>
      </AnimatePopover>
    </>
  )
}
export default React.memo(PdfPage)
