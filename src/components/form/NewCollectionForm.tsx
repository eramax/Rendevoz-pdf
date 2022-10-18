import { Noop } from '@/common/types'
import useCollectionStore from '@/stores/collection.store'
import { FC, useEffect, useRef } from 'react'
import { ICollection } from '~/typings/data'
import { Form } from '../base'
import CollectionItem from '../collection/CollectionItem'

interface NewCollectionFormProps {
  parentCollection?: ICollection | null
  onAddCollection?: (collection: ICollection) => void
  onBack?: Noop
}
const NewCollectionForm: FC<NewCollectionFormProps> = ({ parentCollection, onAddCollection, onBack }) => {
  const collection = useRef<ICollection>({ parentId: parentCollection?.id })
  collection.current.parentId = parentCollection?.id
  const { addCollection } = useCollectionStore()

  return (
    <Form
      style={{ height: '100%' }}
      title="Create collection"
      onSubmit={() => {
        const c = addCollection(collection.current)
        onAddCollection?.(c)
      }}
      onBack={onBack}
    >
      <Form.Item
        required
        requireMessage="Please input collection name!"
        type="input"
        text="Name"
        onChange={value => (collection.current.name = value)}
      ></Form.Item>
      <Form.Item type="component">Under: {parentCollection ? <CollectionItem collection={parentCollection} /> : 'Root'}</Form.Item>
    </Form>
  )
}

export default NewCollectionForm
