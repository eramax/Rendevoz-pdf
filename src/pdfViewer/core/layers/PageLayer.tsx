import { PageViewport, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import { FC, memo, MutableRefObject, ReactElement, useRef, useState } from 'react'
import { useIntersection, useIsomorphicLayoutEffect } from 'react-use'
import { RenderPageProps } from '../types'
import { getPage } from '../utils/pages'
import CanvasLayer from './CanvasLayer'
import TextLayer from './TextLayer'
import styles from './index.module.less'
import Spinner from '@/components/base/Spinner'
import { useMemoizedFn } from '@/hooks'
import AnnotationLayer from './AnnotationLayer'
import { IAnnotation } from '../types/annotation'

interface PageLayerProps {
  doc: PDFDocumentProxy
  height: number
  scale: number
  width: number
  pageIndex: number
  renderPage?: (props: RenderPageProps) => ReactElement
  renderAnnotation?: (annotation: IAnnotation) => ReactElement
  scrollElement?: MutableRefObject<HTMLDivElement>
}
interface PageDetails {
  page: PDFPageProxy | null
  viewport: PageViewport | null
}
// todo: impl page rotation
const PageLayer: FC<PageLayerProps> = ({ doc, height, scale, width, pageIndex, renderPage, renderAnnotation, scrollElement }) => {
  const [pageDetails, setPageDetails] = useState<PageDetails>({ page: null, viewport: null })
  const pageRef = useRef<HTMLDivElement>(null)
  const observer = useIntersection(pageRef, {
    root: scrollElement?.current,
    rootMargin: '200px 0px 200px 0px',
    threshold: 0
  })

  const getPageDetails = () => {
    getPage(doc, pageIndex).then(page => {
      const viewport = page.getViewport({ scale })
      setPageDetails({
        page,
        viewport
      })
    })
  }

  const pageRenderer = useMemoizedFn((props: RenderPageProps): ReactElement => {
    if (renderPage) {
      return renderPage(props)
    } else {
      return (
        <>
          {props.canvasLayer}
          {props.textLayer}
          {props.annotationLayer}
        </>
      )
    }
  })
  useIsomorphicLayoutEffect(() => {
    getPageDetails()
  }, [scale])
  return (
    <div
      ref={pageRef}
      style={{
        height,
        width
      }}
      className={styles.pageLayer}
    >
      {pageDetails.page && pageDetails.viewport ? (
        <>
          <div
            style={{
              display: observer?.isIntersecting ? undefined : 'none',
              width: '100%',
              height: '100%'
            }}
          >
            {pageRenderer({
              canvasLayer: (
                <CanvasLayer page={pageDetails.page} scale={scale} width={width} height={height} viewport={pageDetails.viewport} />
              ),
              textLayer: (
                <TextLayer
                  pageIndex={pageIndex}
                  page={pageDetails.page}
                  scale={scale}
                  rotation={0}
                  width={width}
                  height={height}
                  viewport={pageDetails.viewport}
                />
              ),
              annotationLayer: (
                <AnnotationLayer
                  page={pageDetails.page}
                  height={height}
                  width={width}
                  scale={scale}
                  viewport={pageDetails.viewport}
                  renderAnnotation={renderAnnotation}
                />
              ),
              pageIndex: pageIndex,
              pageSize: { width, height, scale }
            })}
          </div>
          {!observer?.isIntersecting && <Spinner size={50} />}
        </>
      ) : (
        <Spinner size={50} />
      )}
    </div>
  )
}

export default memo(PageLayer)
