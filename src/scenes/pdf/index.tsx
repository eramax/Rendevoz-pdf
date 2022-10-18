import Container from '@/components/base/container'
import Sidebar from '@/components/pdf/components/sidebar'
import { PdfViewer } from '@/components/pdf/PdfViewer'
import useCurrentViewingPdf from '@/hooks/components/useCurrentViewingPdf'
import { ipcInstance } from '@/plugins'
import useDocumentStore from '@/stores/document.store'
import { FC, useState } from 'react'
import { useParams } from 'react-router-dom'
import PdfPageHeader from './Header'
import { Content } from '@/components'
import { Provider } from 'jotai'
import { PdfScope } from '@/jotai/jotaiScope'
import { useIsomorphicLayoutEffect } from 'react-use'

const PdfPage: FC = () => {
  const { id } = useParams()
  const { documents } = useDocumentStore()
  const [, setCurrentViewingPdf] = useCurrentViewingPdf()
  const [fileUrl, setFileUrl] = useState()

  useIsomorphicLayoutEffect(() => {
    if (!fileUrl) {
      const fileUrl = documents.get(parseInt(id))?.fileUrl
      ipcInstance.send('readPdf', fileUrl).then(res => {
        setFileUrl(res.data)
      })
      setCurrentViewingPdf(documents.get(parseInt(id)))
    }
  }, [documents])

  return (
    <Provider scope={PdfScope}>
      <Container auto>
        <Content flex column fullHeight fullWidth>
          <PdfPageHeader />
          <Content flex centered>
            <PdfViewer fileUrl={fileUrl} document={documents.get(parseInt(id))} />
            <Sidebar />
          </Content>
        </Content>
      </Container>
    </Provider>
  )
}
export default PdfPage
