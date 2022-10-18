import { ICollection, INote, IPdfDocument } from '~/typings/data'
import { useCurrentSelect } from './useCurrentSelect'
import { useNavigate } from 'react-router-dom'
import { Content, Image } from '../base'
import { Icon } from '@/components'
import styles from './index.module.less'
import { format, formatDistanceToNow } from 'date-fns'
import { RippleButton } from '../custom/rippleButton'
import useDocumentStore from '@/stores/document.store'
import { Noop } from '@/common/types'
import { FC, useState } from 'react'
import Modal from '../base/modal'
import DeleteDocumentDialog from '../dialogs/DeleteDocumentDialog'
import { isDocument, isNote } from './utils'

interface DetailsProps {
  onDelete: Noop
}

const CollectionDetails = ({ collection = {} as ICollection }) => {
  return <div>{collection?.name}</div>
}
const PdfDetails = ({ pdf, onDelete }: { pdf?: IPdfDocument; onDelete?: Noop }) => {
  const navigate = useNavigate()
  const [deleteDocumentModalVisible, setDeleteDocumentModalVisible] = useState(false)
  const { deleteDocumentById } = useDocumentStore()
  const handleDelete = () => {
    pdf?.id && deleteDocumentById(pdf.id), onDelete?.(), setDeleteDocumentModalVisible(false)
  }
  return (
    <Content flex column>
      <Content flex centered>
        <div className={styles.coverWrapper}>
          <Image
            placeHolder={
              <div style={{ inset: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={40} fill="#8590aea8" name="park-pic" />
              </div>
            }
            className={styles.cover}
            draggable={false}
            src={pdf?.metadata?.coverUrl || 'https://picsum.photos/200/300'}
          />
        </div>
      </Content>
      <Content flex centered className={styles.title}>
        {pdf?.metadata?.title || 'Untitled'}
      </Content>
      <Content flex centered className={styles.author}>
        {pdf?.metadata?.author || 'Unknown'}
      </Content>
      <Content flex className={styles.detailsWrapper}>
        <span>Last viewed</span>
        <span>{pdf?.lastReadAt ? `${formatDistanceToNow(pdf?.lastReadAt || 0, { includeSeconds: false })} before` : 'never viewed'}</span>
      </Content>
      <Content flex className={styles.detailsWrapper}>
        <span>Read Progress</span>
        <span>{Math.floor((pdf?.readProgress || 0) * 100)}%</span>
      </Content>
      <Content flex className={styles.detailsWrapper}>
        <span>Total Notes</span>
        <span>{pdf?.noteIds?.length || 0}</span>
      </Content>
      <Content flex alignItems="center" justifyContent="space-between" className={styles.buttonWrapper}>
        <RippleButton onClick={() => navigate(`/pdf/${pdf?.id}`)}>Read</RippleButton>
        <RippleButton onClick={() => setDeleteDocumentModalVisible(true)}>Delete</RippleButton>
        <Modal visible={deleteDocumentModalVisible} onClose={() => setDeleteDocumentModalVisible(false)}>
          <DeleteDocumentDialog onSubmit={handleDelete} onBack={() => setDeleteDocumentModalVisible(false)} />
        </Modal>
      </Content>
    </Content>
  )
}
const NoteDetails = ({ note }: { note: INote }) => {
  const navigate = useNavigate()
  return (
    <Content flex column>
      <div className={styles.title}>{note.title}</div>
      {note.createdAt && <div>Created at {format(note.createdAt, 'd MMM yyyy')}</div>}
      {note.updatedAt && <div>Modified at {format(note.updatedAt, 'd MMM yyyy')}</div>}
      <Content flex alignItems="center" justifyContent="space-between" className={styles.buttonWrapper}>
        <RippleButton
          onClick={() => {
            navigate(`/editor/${note.id}`)
          }}
        >
          Open
        </RippleButton>
        <RippleButton onClick={() => {}}>Delete</RippleButton>
      </Content>
    </Content>
  )
}
const Details: FC<DetailsProps> = ({ onDelete }) => {
  const currentSelect = useCurrentSelect()
  const collection = currentSelect as ICollection
  const pdf = currentSelect as IPdfDocument
  const note = currentSelect as INote
  return (
    <>
      {currentSelect && (
        <>
          {/* {collection.parentId && <CollectionDetails collection={collection} />} */}
          {isDocument(currentSelect) && <PdfDetails pdf={pdf} onDelete={onDelete} />}
          {isNote(currentSelect) && <NoteDetails note={note} />}
        </>
      )}
    </>
  )
}

export default Details
