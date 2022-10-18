import { PageViewport, PDFPageProxy } from 'pdfjs-dist'
import { FC, memo, ReactElement, useEffect, useMemo, useState } from 'react'
import { useIsomorphicLayoutEffect } from 'react-use'
import Annotation from '../annotation/Annotation'
import { IAnnotation } from '../types/annotation'

interface AnnotationLayerProps {
  page: PDFPageProxy
  width: number
  height: number
  viewport: PageViewport
  scale?: number
  renderAnnotation?: (annotation: IAnnotation) => ReactElement
}

const AnnotationLayer: FC<AnnotationLayerProps> = ({ page, width, height, scale, viewport, renderAnnotation }) => {
  const [annotations, setAnnotations] = useState<IAnnotation[]>()
  useIsomorphicLayoutEffect(() => {
    page.getAnnotations({ intent: 'display' }).then(data => {
      setAnnotations(data)
    })
  }, [])
  const clonedViewport = useMemo(() => viewport.clone({ dontFlip: true }), [viewport])
  useEffect(() => {
    console.log('viewport change')
  },[viewport])
  return (
    <div
      style={{
        width,
        height,
        overflow: 'hidden',
        position: 'relative',
        pointerEvents: 'none'
      }}
    >
      {annotations
        ?.filter(i => !i?.parentId)
        .map(i => (
          <Annotation {...i} page={page} viewport={clonedViewport} renderAnnotation={renderAnnotation}/>
        ))}
    </div>
  )
}

export default memo(AnnotationLayer)
