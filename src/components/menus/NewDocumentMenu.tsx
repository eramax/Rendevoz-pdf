import Icon from '@/components/base/Icon'
import Modal from '@/components/base/modal'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Menu from '../base/menu'
import NewDocumentDialog from '../dialogs/NewDocumentDialog'

const NewDocumentMenu = () => {
  const [newPdfModalOpen, setNewPdfModalOpen] = useState(false)
  return (
    <>
      <Modal minWidth={500} minHeight={400} visible={newPdfModalOpen} onClose={() => setNewPdfModalOpen(false)}>
        <NewDocumentDialog onSubmit={() => setNewPdfModalOpen(false)} onBack={() => setNewPdfModalOpen(false)} />
      </Modal>
      <Menu>
        <Menu.Item onClick={e => setNewPdfModalOpen(true)} type="button" icon={<Icon name="park-file-pdf-one" size={18} />}>
          Pdf
        </Menu.Item>
      </Menu>
    </>
  )
}

export default NewDocumentMenu
