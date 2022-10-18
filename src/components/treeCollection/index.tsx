import useCollectionStore from '@/stores/collection.store'
import { useEffect, useState } from 'react'
import { ICollection, INote, IPdfDocument } from '~/typings/data'
import { Content } from '../base'
import TreeCollectionItem from './Item'
import { AnimatePresence, motion } from 'framer-motion'
import { isNote, isDocument } from '../collection/utils'
const TreeCollectionRoot = ({ onChoose }: { onChoose: (id: number) => void }) => {
  const { rootCollections } = useCollectionStore()
  return (
    <Content flex column>
      {rootCollections.map(i => (
        <TreeCollection collection={i} onChoose={onChoose} />
      ))}
    </Content>
  )
}
const TreeCollection = ({ collection, onChoose }: { collection: ICollection; onChoose: (id: number) => void }) => {
  const { getChildrenItems, getChildrenCollections, findSubCollections } = useCollectionStore()
  const [collapsed, setCollapsed] = useState(true)
  const [childrenItems, setChildrenItems] = useState([])
  const childrenNotes = childrenItems.filter(i => isNote(i)) as INote[]
  const childrenDocuments = childrenItems.filter(i => isDocument(i)) as IPdfDocument[]
  const childrenCollections = getChildrenCollections(collection.id)
  useEffect(() => {
    getChildrenItems(collection.id).then(items => setChildrenItems(items.filter(i => !!i)))
  }, [])

  return (
    <Content>
      <TreeCollectionItem
        onClick={() => {
          setCollapsed(!collapsed)
        }}
        collapsed={collapsed}
        name={collection.name}
        id={collection.id}
        type="collection"
      />
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <Content flex column style={{ paddingLeft: 10 }}>
              {childrenCollections.map(i => (
                <TreeCollection collection={i} />
              ))}

              {childrenNotes.map(i => (
                <TreeCollectionItem onClick={() => onChoose(i.id)} id={i.id} name={i.title} type="note" />
              ))}
            </Content>
          </motion.div>
        )}
      </AnimatePresence>
    </Content>
  )
}

export default TreeCollectionRoot
