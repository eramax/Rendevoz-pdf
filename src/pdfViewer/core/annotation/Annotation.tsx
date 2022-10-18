import { PageViewport, PDFPageProxy } from 'pdfjs-dist'
import { FC, ReactElement } from 'react'
import { IAnnotation } from '../types/annotation'

interface AnnotationProps extends IAnnotation {
  page: PDFPageProxy
  viewport: PageViewport
  renderAnnotation?: (annotaion: IAnnotation) => ReactElement
}
const Annotation: FC<AnnotationProps> = ({ page, viewport, rect, annotationType, renderAnnotation, ...rest }) => {
  const bound = {
    left: Math.min(rect[0], rect[2]),
    top: page.view[1] + page.view[3] - Math.max(rect[1], rect[3]),
    height: rect[3] - rect[1],
    width: rect[2] - rect[0]
  }
  return (
    <div
      style={{
        position: 'absolute',
        ...bound,
        transform: `matrix(${viewport.transform.join(',')})`,
        transformOrigin: `-${bound.left}px -${bound.top}px`,
        pointerEvents: 'auto'
      }}
    >
      {renderAnnotation?.({ rect, annotationType, ...rest, pageIndex: page.pageNumber - 1 })}
    </div>
  )
}

export default Annotation
