import { Range } from '@tanstack/react-virtual'
import { PDFDocumentProxy } from 'pdfjs-dist'
import { FC, ReactElement } from 'react'
import Layout from './layouts/Layout'
import LayoutWrapper from './layouts/LayoutWrapper'
import Loader from './Loader'
import PdfProvider from './Provider'
import { RenderPageProps } from './types'
import { IAnnotation } from './types/annotation'
import { ScrollMode } from './types/layout'
import PdfJs from './types/pdfJsApi'
import PdfJsUrl from '@/assets/pdf.worker.min.js?url'
interface ViewerProps {
  fileUrl: string | Uint8Array
  initialPage?: number
  scrollMode?: ScrollMode
  renderPage?: (props: RenderPageProps) => ReactElement
  renderAnnotation?: (annotation: IAnnotation) => ReactElement
  layoutClassName?: string
  innerRef: any
  onDocumentLoaded?: (doc: PDFDocumentProxy) => void
  onRangeChange?: (range: Range) => void
}

const Viewer: FC<ViewerProps> = ({
  fileUrl,
  initialPage = 0,
  scrollMode = 'vertical',
  renderPage,
  renderAnnotation,
  innerRef,
  layoutClassName,
  onDocumentLoaded,
  onRangeChange
}) => {
  PdfJs.GlobalWorkerOptions.workerSrc = PdfJsUrl
  return (
    <PdfProvider>
      <Loader onDocumentLoaded={onDocumentLoaded} file={fileUrl}>
        {doc => (
          <LayoutWrapper doc={doc}>
            {pageSize => (
              <Layout
                className={layoutClassName}
                renderPage={renderPage}
                innerRef={innerRef}
                onRangeChange={onRangeChange}
                renderAnnotation={renderAnnotation}
                initialPage={initialPage}
                doc={doc}
                pageSize={pageSize}
              ></Layout>
            )}
          </LayoutWrapper>
        )}
      </Loader>
    </PdfProvider>
  )
}

export default Viewer
