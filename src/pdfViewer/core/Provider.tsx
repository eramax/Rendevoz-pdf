import { Provider } from 'jotai'

export const PdfViewInnerScope = Symbol('pdfInnerViewer')

const PdfProvider = ({ children }) => {
  return <Provider scope={PdfViewInnerScope}>{children}</Provider>
}

export default PdfProvider
