import { PDFDocumentProxy } from 'pdfjs-dist'
import { FC, memo, ReactElement, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { defaultRangeExtractor, Range, useVirtualizer, Virtualizer } from '@tanstack/react-virtual'
import { useDebounceFn, useMemoizedFn, useUpdateEffect } from '@/hooks'
import PageLayer from '../layers/PageLayer'
import { PageSize, RenderPageProps } from '../types/page'
import { useScrollMode } from '../hooks/useScrollMode'
import { IAnnotation } from '../types/annotation'
import { Noop } from '@/common/types'
import { decreaseLevel, increaseLevel } from '../utils/zoom'
import PanHelper from '../utils/pan'

interface LayoutProps {
  doc: PDFDocumentProxy
  defaultScale?: number
  initialPage: number
  pageSize: PageSize
  renderPage?: (props: RenderPageProps) => ReactElement
  renderAnnotation?: (annotation: IAnnotation) => ReactElement
  onRangeChange?: (range?: Range) => void
  innerRef: any
  className?: string
}
export interface LayoutFunctions {
  jumpToPage: (pageIndex: number) => void
  search: (word: string) => void
  zoomIn: Noop
  zoomOut: Noop
  autoFit: Noop
  togglePan: Noop
}
const PAGE_SPACING = 10
const Layout: FC<LayoutProps> = ({
  doc,
  defaultScale,
  initialPage,
  pageSize,
  renderPage,
  renderAnnotation,
  innerRef,
  className,
  onRangeChange
}) => {
  const { numPages } = doc
  const [scrollMode] = useScrollMode()
  const pagesRef = useRef<HTMLDivElement>(null)
  const visibleRangeRef = useRef([0, 0])
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(pageSize.scale)
  const [enablePan, setEnablePan] = useState(false)

  const scaleRef = useRef(pageSize.scale)
  const currentRangeRef = useRef<Range>()
  useImperativeHandle(innerRef, () => ({ jumpToPage, zoomIn, zoomOut, autoFit, togglePan }))
  const { height, width } = pageSize
  const rect =
    Math.abs(rotation) % 180 === 0
      ? {
          h: height,
          w: width
        }
      : {
          h: width,
          w: height
        }
  const result = {
    height: rect.h * scale,
    width: rect.w * scale
  }
  const estimateSize = () => {
    return (scrollMode === 'horizontal' ? result.width : result.height) + PAGE_SPACING
  }
  const rangeExtractor = useMemoizedFn(range => {
    visibleRangeRef.current = [range.startIndex, range.endIndex]
    currentRangeRef.current = range
    return defaultRangeExtractor(range)
  })

  const virtualizer = useVirtualizer({
    count: numPages,
    getScrollElement: () => pagesRef.current,
    estimateSize,
    rangeExtractor,
    overscan: 2,
    measureElement: () => {
      return scaleRef.current * pageSize.height + PAGE_SPACING
    }
  })
  useUpdateEffect(() => {
    setScale(pageSize.scale)
  }, [pageSize])
  useUpdateEffect(() => {
    const previousScale = scaleRef.current
    scaleRef.current = scale
    const pages = pagesRef.current
    if (!pages) {
      return
    }
    const { scrollTop, scrollLeft } = pages
    const newOffset = {
      scrollTop: scrollTop * (scale / previousScale),
      scrollLeft: scrollLeft * (scale / previousScale)
    }
    virtualizer.measure()
    virtualizer.scrollToOffset(newOffset.scrollTop, { smoothScroll: false })
  }, [scale])
  const jumpToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < numPages) {
      const currentStartIndex = currentRangeRef.current?.startIndex || 0
      let smoothScroll = true
      if (Math.abs(pageIndex - currentStartIndex) > 5) {
        smoothScroll = false
      }
      virtualizer.scrollToIndex(pageIndex, { align: 'start', smoothScroll })
    }
  }
  const zoomIn = () => {
    const nextScale = increaseLevel(scale)
    setScale(nextScale)
  }
  const zoomOut = () => {
    const nextScale = decreaseLevel(scale)
    setScale(nextScale)
  }
  const autoFit = () => {
    setScale(pageSize.scale)
  }
  const togglePan = () => {
    setEnablePan(!enablePan)
  }
  const renderViewer = () => {
    return (
      <div style={{ height: `${estimateSize() * numPages}px`, width: '100%', position: 'relative' }}>
        {virtualizer.getVirtualItems().map(item => (
          <div
            ref={item.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${estimateSize()}px`,
              transform: `translateY(${item.index * estimateSize()}px)`,
              paddingBottom: 10
            }}
            key={item.index}
            data-page-index={item.index}
          >
            <PageLayer
              scrollElement={pagesRef}
              renderPage={renderPage}
              doc={doc}
              height={result.height}
              pageIndex={item.index}
              scale={scale}
              width={result.width}
              renderAnnotation={renderAnnotation}
            />
          </div>
        ))}
      </div>
    )
  }
  const { run: handleScroll } = useDebounceFn(
    e => {
      currentRangeRef.current = {
        ...currentRangeRef.current,
        progress: e.target.scrollTop / e.target.scrollHeight
      }
      onRangeChange?.(currentRangeRef.current)
    },
    { wait: 200 }
  )
  useEffect(() => {
    if (initialPage) {
      virtualizer.scrollToIndex(initialPage, { align: 'start', smoothScroll: false })
    }
    const pages = pagesRef.current
    if (pages) {
      pages.addEventListener('scroll', handleScroll)
    }
    return () => {
      pages?.removeEventListener('scroll', handleScroll)
    }
  }, [doc])
  return (
    <div className={className} ref={pagesRef} style={{ height: '100%', width: '100%', overflow: 'auto' }}>
      <PanHelper enablePan={enablePan} containerEle={pagesRef.current} />
      {renderViewer()}
    </div>
  )
}

export default memo(Layout)
