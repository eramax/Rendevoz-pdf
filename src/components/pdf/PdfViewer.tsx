import { IPdfDocument } from '@/../typings/data'
import Viewer from '@/pdfViewer/core/Viewer'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import PdfPage from './components/page/Page'
import { usePdfNote } from './hooks/usePdfNote'
import styles from './index.module.less'
import _ from 'lodash'
import { Toolbar } from './components/toolbar'
import { useEditorVisible } from '../editor/hooks/useEditorVisible'
import useEventEmitter from '@/events/useEventEmitter'
import { HeadingElementBuilder } from '../editor/elements/heading'
import { PdfEventHandler } from '@/events/pdfEvent'
import { RenderPageProps } from '@/pdfViewer/core/types'
import { LayoutFunctions } from '@/pdfViewer/core/layouts/Layout'
import { PDFDocumentProxy } from 'pdfjs-dist'
import { useMemoizedFn, useMount, useUnMount } from '@/hooks'
import useDocumentStore from '@/stores/document.store'
import usePdfInfo from './hooks/usePdfInfo'
import { Range } from '@tanstack/react-virtual'
import useCollapsed from './hooks/useCollapsed'
import { motion } from 'framer-motion'
import { AnnotationType, IAnnotation } from '@/pdfViewer/core/types/annotation'
import Link from './components/annotation/Link'
import useLabelStore from '@/stores/label.store'
import useLatest from '@/hooks/utils/useLatest'
import produce from 'immer'
import useCurrentDocument from '@/hooks/components/useCurrentDocument'

// todo: canvas change render text & background color
// CanvasRenderingContext2D.prototype.fillText = (function () {
//   const original = CanvasRenderingContext2D.prototype.fillText
//   return function () {
//     const orig = this['fillStyle']
//     this['fillStyle'] = 'red'
//     const res = original.apply(this, arguments)
//     this['fillStyle'] = orig
//     // return res
//   }
// })()
// CanvasRenderingContext2D.prototype.fillRect = (function () {
//   const original = CanvasRenderingContext2D.prototype.fillRect
//   return function () {
//     const orig = this['fillStyle']
//     this['fillStyle'] = 'rgb(255, 230, 230)'
//     const res = original.apply(this, arguments)
//     this['fillStyle'] = orig
//     // return res
//   }
// })()
// CanvasRenderingContext2D.prototype.fill = (function () {
//   const original = CanvasRenderingContext2D.prototype.fill
//   return function () {
//     const orig = this['fillStyle']
//     this['fillStyle'] = 'red'
//     const res = original.apply(this, arguments)
//     this['fillStyle'] = orig
//     // do something else
//     return res
//   }
// })()
interface PdfViewerProps {
  fileUrl?: string
  document?: IPdfDocument
}
export const PdfViewer: FC<PdfViewerProps> = ({ fileUrl, document }) => {
  const [pdfInfo, setPdfInfo] = usePdfInfo()
  const [pdfNote, setPdfNote] = usePdfNote()
  const [,setCurrentDocument] = useCurrentDocument()
  const latestPdfInfo = useLatest(pdfInfo)
  const latestPdfNote = useLatest(pdfNote)
  const latestDocument = useLatest(document)
  const [collapsed] = useCollapsed()
  const [textLayerVisible, setTextLayerVisible] = useState(true)
  const [contextMenuVisible, setContextMenuVisible] = useState(false)
  const pdfViewRef = useRef<LayoutFunctions>(null)
  const [editorVisible, setEditorVisible] = useEditorVisible()
  const [translateVisible, setTranslateVisible] = useState(false)
  const { updateDocument } = useDocumentStore()
  const { getLabelsByDocumentId, bulkInsertLabel } = useLabelStore()
  // ref to store pdf viewer instance
  const viewerBoxRef = useRef<HTMLDivElement>(null)
  // ref to store pdf document
  const documentRef = useRef<PDFDocumentProxy>()
  // context event emitter
  const emitter = useEventEmitter()

  const handleOpenMenu = useCallback(e => {
    e.preventDefault()
    setContextMenuVisible(true)
  }, [])
  useEffect(() => {
    if (document) {
      setPdfInfo(document)
      setCurrentDocument(document)
      Promise.resolve(getLabelsByDocumentId(document.id)).then(data => setPdfNote({ ...pdfNote, labels: data || [] }))
    }
    return () => {
      setCurrentDocument(null)
      const pdfInfo = latestPdfInfo.current
      const pdfNote = latestPdfNote.current
      const document = latestDocument.current
      const clonedNote = produce(pdfNote, draft => {
        draft.labels.forEach(i => (i.documentId = document?.id))
      })
      if (document) {
        const newDocument: IPdfDocument = {
          ...document,
          lastReadAt: Date.now(),
          readProgress: pdfInfo?.readProgress,
          lastReadPage: pdfInfo?.lastReadPage
        }
        updateDocument(newDocument)
      }
      if (clonedNote.labels) {
        bulkInsertLabel(clonedNote.labels)
      }
    }
  }, [document?.id])
  useEffect(() => {
    viewerBoxRef.current?.addEventListener('contextmenu', handleOpenMenu)
    return () => {
      viewerBoxRef.current?.removeEventListener('contextmenu', handleOpenMenu)
    }
  })

  const eventHandler = new PdfEventHandler()
  eventHandler.on('textSelect', data => {
    console.log(data.selectedText)
    // setPdfHighlights({
    //   type: 'insert',
    //   value: {
    //     page: data.pageIndex,
    //     selectedText: data.selectedText,
    //     id: Id.getId(),
    //     rects: data.rects?.map(r => ({
    //       percentageTop: r.percentageTop,
    //       percentageHeight: r.percentageHeight,
    //       percentageLeft: r.percentageLeft,
    //       percentageWidth: r.percentageWidth
    //     }))
    //   }
    // })
    // console.log(data)
  })
  eventHandler.on('jumpToDest', data => {
    if (typeof data.dest === 'string') {
      documentRef.current?.getDestination(data.dest).then(dest => {
        documentRef.current?.getPageIndex(dest[0]).then(page => pdfViewRef.current?.jumpToPage(page))
      })
    } else {
      documentRef.current?.getPageIndex(data.dest[0]).then(page => pdfViewRef.current?.jumpToPage(page))
    }
  })
  eventHandler.on('jumpToPage', data => {
    pdfViewRef.current?.jumpToPage(data.pageIndex)
  })
  eventHandler.on('zoomIn', () => pdfViewRef.current?.zoomIn())
  eventHandler.on('zoomOut', () => pdfViewRef.current?.zoomOut())
  eventHandler.on('autoFit', () => pdfViewRef.current?.autoFit())
  eventHandler.on('togglePan', () => pdfViewRef.current?.togglePan())
  useEffect(() => {
    emitter.addListener('pdf', eventHandler)
    return () => emitter.removeListener('pdf', eventHandler)
  })

  const renderPage = useCallback(
    (props: RenderPageProps) => (
      <PdfPage
        key={props.pageIndex}
        {...props}
        enableCrop
        textLayerVisible={textLayerVisible}
        // onCanvasLayerDragEnd={e => {}}
        // onCanvasLayerDrag={e => {}}
        // onCanvasLayerClick={e => {}}
        // onTextSelectionClick={e => {}}
      />
    ),
    []
  )
  const handleRangeChange = useMemoizedFn((range?: Range) => {
    if (range) {
      const progress = range?.progress || 0
      setPdfInfo({ ...pdfInfo, readProgress: progress, lastReadPage: range.startIndex })
    }
  })
  const ToolbarElement = () => {
    return (
      <Toolbar
        onOpenEditorClick={() => {
          setEditorVisible(!editorVisible)
        }}
        onZoomInClick={() => {}}
        onZoomOutClick={() => {}}
        onOpenTranslateClick={() => {
          setTranslateVisible(!translateVisible)
        }}
        onExtractOutline={() => {
          documentRef.current?.getOutline().then(outlines => {
            outlines.forEach(outline => traverseOutline(outline, 0))
          })
        }}
      />
    )
  }
  function traverseOutline(outline: PdfJs.Outline, depth: number) {
    emitter.emit('editor', {
      type: 'insertNode',
      data: {
        element: HeadingElementBuilder.build({ level: depth, title: outline.title, dest: outline.dest })
      }
    })
    if (outline.items.length > 0) {
      outline.items.forEach(o => traverseOutline(o, depth + 1))
    }
  }
  const renderAnnotation = useCallback((annotation: IAnnotation) => {
    switch (annotation.annotationType) {
      case AnnotationType.Link:
        return (
          <Link
            onClick={() => {
              console.log(annotation.pageIndex)
              if (annotation.dest?.[0].num) {
                documentRef.current?.getPageIndex(annotation.dest[0]).then(idx => pdfViewRef.current?.jumpToPage(idx))
              }
            }}
          />
        )
    }
  }, [])
  return (
    <>
      <div
        style={{
          flexBasis: collapsed ? '80%' : undefined,
          flexShrink: collapsed ? 0 : 1,
          flexGrow: collapsed ? 0 : 1,
          transition: collapsed ? '0.5s ease' : undefined
        }}
        className={styles.flexColumnWrapper}
      >
        <div className={styles.viewerBox}>
          {fileUrl && (
            <Viewer
              onDocumentLoaded={doc => (documentRef.current = doc)}
              layoutClassName={styles.viewerLayout}
              innerRef={pdfViewRef}
              fileUrl={fileUrl}
              renderPage={renderPage}
              renderAnnotation={renderAnnotation}
              onRangeChange={handleRangeChange}
              initialPage={document?.lastReadPage}
            />
          )}
        </div>
      </div>
    </>
  )
}
