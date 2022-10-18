import { FC, useState } from 'react'
import { ICollection, IPdfDocument } from '~/typings/data'
import { Content, Footer } from '../base'
import useCurrentDocument from '../../hooks/components/useCurrentDocument'
import { IDialog } from './type'
import Icon from '../base/Icon'
import SwitchAnimation from '../base/animation/SwitchAnimation'
import ChooseCollectionDialog from './ChooseCollectionDialog'
import Switch from '../base/Switch'
import toast from 'react-hot-toast'

const SaveNoteDialog: FC<Omit<IDialog, 'onSubmit'> & { onSubmit: (confirm: boolean, collection: ICollection) => void }> = ({
  onCancel,
  onSubmit
}) => {
  const [currentDocument] = useCurrentDocument()
  const [confirm, setConfirm] = useState(true)
  const [collection, setCollection] = useState<ICollection>()
  const [chooseCollectionVisible, setChooseCollectionVisible] = useState(false)
  const handleSubmit = () => {
    if (!collection) {
      toast.error('Choose one collection!')
      return
    }
    onSubmit?.(confirm, collection)
  }
  return (
    <Content style={{ maxWidth: 400, minWidth: 300, minHeight: 300, position: 'relative' }}>
      <SwitchAnimation direction={chooseCollectionVisible}>
        {switchwrapper =>
          chooseCollectionVisible
            ? switchwrapper(
                <ChooseCollectionDialog
                  onChoose={c => {
                    setCollection(c)
                    setChooseCollectionVisible(false)
                  }}
                  onBack={() => setChooseCollectionVisible(false)}
                />,
                'choose'
              )
            : switchwrapper(
                <Content flex column alignItems="center" justifyContent="space-between" fullHeight>
                  <div style={{ fontWeight: 600, fontSize: 22, marginBottom: 20 }}>Save note</div>
                  {currentDocument && (
                    <div style={{ marginBottom: 20, width: '100%' }}>
                      <Content flex column gap={20} alignItems="center" fullWidth>
                        <Content flex fullWidth column>
                          Current document:
                          <span style={{ color: '#8590ae', fontWeight: 600, wordBreak: 'break-all' }}>
                            {currentDocument.metadata?.title || 'Untitled'}
                          </span>
                        </Content>
                        <Content flex fullWidth justifyContent="space-between">
                          <span>Save note for document</span>
                          <Switch defaultValue={confirm} onChange={v => setConfirm(v)} />
                        </Content>
                      </Content>
                    </div>
                  )}
                  <Content flex column fullWidth fullHeight>
                    Collection:
                    <span
                      style={{ color: '#8590ae', width: 'fit-content', cursor: 'pointer' }}
                      onClick={() => setChooseCollectionVisible(true)}
                    >
                      {collection?.name || 'Choose'}
                    </span>
                  </Content>
                  <div style={{ width: '100%' }}>
                    <Footer onBack={onCancel} onSubmit={handleSubmit}></Footer>
                  </div>
                </Content>,
                'body'
              )
        }
      </SwitchAnimation>
    </Content>
  )
}

export default SaveNoteDialog
