import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'

const pagesMap = new Map<string, PDFPageProxy>()
export const getPage = (doc: PDFDocumentProxy, pageIndex: number): Promise<PDFPageProxy> => {
  if (!doc) {
    return Promise.reject('Document not loaded yet')
  }
  const pageKey = `${doc.loadingTask.docId}_${pageIndex}`
  const page = pagesMap.get(pageKey)
  if (page) {
    return Promise.resolve(page)
  }
  return new Promise((resolve, _) => {
    doc.getPage(pageIndex + 1).then(page => {
      pagesMap.set(pageKey, page)
      resolve(page)
    })
  })
}
