import { Content } from '@/components'
import { EditorV1 } from '@/components/editor/Editor'
import EditorManager from '@/components/editor/EditorManager'
import { useParams, useSearchParams } from 'react-router-dom'

const EditorPage = () => {
  const {id} = useParams()
  const [searchParams] = useSearchParams()
  const documentId = searchParams.get('documentId')

  return (
    <Content style={{ padding: 30, width: '80%', margin: 'auto', height: 'calc( 100% - 30px )' }} flex centered>
      <EditorManager documentId={parseInt(documentId)} initialNoteId={parseInt(id)} />
    </Content>
  )
}

export default EditorPage
