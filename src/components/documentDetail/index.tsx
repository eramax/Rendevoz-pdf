import useDocumentStore from '@/stores/document.store'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { IPdfDocument } from '~/typings/data'
import { Content } from '../base'
import { TabPane, Tabs } from '../base/tabs'
import Overview from './overview'

const DocumentDetails = () => {
  const { id } = useParams()
  const [document, setDocument] = useState<IPdfDocument>()
  const { getDocumentById } = useDocumentStore()
  useEffect(() => {
    const Id = parseInt(id)
    const d = getDocumentById(Id)
    setDocument(d)
  }, [])
  return (
    <Content>
      <Tabs defaultActiveKey="overview">
        <TabPane tab="Overview" key="overview">
          <Overview document={document} />
        </TabPane>
      </Tabs>
    </Content>
  )
}

export default DocumentDetails
