import { Noop } from '@/common/types'
import useCollectionStore from '@/stores/collection.store'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ICollection } from '~/typings/data'
import NewDocumentForm from '../form/newDocumentForm'
import ChooseCollectionDialog from './ChooseCollectionDialog'

const NewDocumentDialog = ({ onSubmit, onBack }: { onSubmit?: Noop; onBack?: Noop }) => {
  const [chosenCollection, setChosenCollection] = useState<ICollection>()
  const { addItemToCollection } = useCollectionStore()
  return (
    <>
      {chosenCollection ? (
        <NewDocumentForm
          onBack={() => setChosenCollection(undefined)}
          onSubmit={doc => {
            addItemToCollection(
              {
                type: 'document',
                id: doc.id
              },
              chosenCollection.id
            ).then(
              () => {
                onSubmit?.()
                toast.success('Successfully add document !')
              },
              reject => {
                toast.error(reject)
              }
            )
          }}
          collection={chosenCollection}
        />
      ) : (
        <ChooseCollectionDialog onBack={onBack} onChoose={collection => setChosenCollection(collection)} />
      )}
    </>
  )
}

export default NewDocumentDialog
