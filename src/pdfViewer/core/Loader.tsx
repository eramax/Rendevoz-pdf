import Spinner from '@/components/base/Spinner'
import { PDFDocumentProxy } from 'pdfjs-dist'
import { FC, useEffect, useRef, useState } from 'react'
import PdfJs from './types/pdfJsApi'
import PdfJsUrl from '@/assets/pdf.worker.min.js?url'
interface LoaderProps {
  file: string | Uint8Array
  children: (doc: PDFDocumentProxy) => React.ReactElement
  onDocumentLoaded?: (doc: PDFDocumentProxy) => void
}
enum LoadingState {
  Complete,
  Fail,
  Loading
}
const Loader: FC<LoaderProps> = ({ file, children, onDocumentLoaded }) => {
  const docRef = useRef<PDFDocumentProxy | null>(null)
  const [loadingState, setLoadingState] = useState(LoadingState.Loading)
  useEffect(() => {
    docRef.current = null
    const params = Object.assign('string' === typeof file ? { url: file } : { data: file })
    PdfJs.GlobalWorkerOptions.workerSrc = PdfJsUrl
    const loadingTask = PdfJs.getDocument(params)
    loadingTask.promise.then(doc => {
      docRef.current = doc
      onDocumentLoaded?.(doc)
      setLoadingState(LoadingState.Complete)
    })
    return () => {
      loadingTask.destroy()
    }
  }, [file])
  if (loadingState === LoadingState.Complete && docRef.current) {
    return children(docRef.current)
  }
  return <Spinner size={50}/>
}
export default Loader
