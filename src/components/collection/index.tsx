import { useToggle, useUnMount } from '@/hooks'
import useCurrentCollection from '@/hooks/components/useCurrentCollection'
import useCollectionStore from '@/stores/collection.store'
import { CSSProperties, FC, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ICollection, INote, IPdfDocument } from '~/typings/data'
import { Breadcrumb, Content } from '../base'
import Container from '../base/container'
import Modal from '../base/modal'
import NewCollectionForm from '../form/NewCollectionForm'
import Icon from '../base/Icon'
import CollectionItem from './CollectionItem'
import Details from './Details'
import DocumentItem from './DocumentItem'
import styles from './index.module.less'
import NoteItem from './NoteItem'
import { CurrentSelectContext } from './useCurrentSelect'
import { isDocument, isNote } from './utils'

interface CollectionProps {
  hideDetails?: boolean
  hideDocuments?: boolean
  hideCollections?: boolean
  hideNotes?: boolean
  hideBreadcrumb?: boolean
  hideActions?: boolean
  hideExtra?: boolean
  onCollectionSelect?: (selectedCollection?: ICollection) => void
  onCollectionChange?: (currentCollection?: ICollection | null) => void
  useRoute?: boolean
  defaultId?: number
  style?: CSSProperties
}
const Collection: FC<CollectionProps> = ({
  hideDetails = false,
  hideNotes = true,
  hideExtra = true,
  hideCollections,
  hideDocuments,
  hideActions = true,
  useRoute = true,
  hideBreadcrumb = false,
  defaultId,
  onCollectionChange,
  onCollectionSelect,
  style
}) => {
  const navigate = useNavigate()
  const { all, one, findParentCollections, getChildrenCollections, getChildrenItems } = useCollectionStore()
  const [newCollectionVisible, toggleNewCollectionVisible] = useToggle(false)
  const [currentSelect, setCurrentSelect] = useState<ICollection | IPdfDocument>()
  const [currentCollection, setCurrentCollection] = useCurrentCollection()
  const [parentCollections, setParentCollections] = useState<ICollection[]>([])
  const childrenCollections = getChildrenCollections(currentCollection?.id || defaultId)
  const [childrenItems, setChildrenItems] = useState<any[]>([])
  const childrenNotes = childrenItems.filter(i => isNote(i)) as INote[]
  const childrenDocuments = childrenItems.filter(i => isDocument(i)) as IPdfDocument[]
  const actions = useRef([])
  const bodyRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    console.log('fetched by all')
    if (defaultId) {
      setParentCollections(findParentCollections(one(defaultId)))
    }
  }, [all])
  useEffect(() => {
    if (actions.current.length === 0) {
      actions.current.push(currentCollection)
    }
    console.log(currentCollection)
    onCollectionChange?.(currentCollection)
    if (currentCollection) {
      getChildrenItems(currentCollection.id).then(items => {
        console.log(items)
        setChildrenItems(items.filter(i => !!i))
      })
      setParentCollections(findParentCollections(currentCollection))
    } else if (currentCollection === null) {
      setParentCollections([])
      setChildrenItems([])
    }
  }, [currentCollection])
  useEffect(() => {
    onCollectionSelect?.(currentSelect)
  }, [currentSelect])

  const handleCollectionClick = (e: React.MouseEvent<Element, MouseEvent>, c: ICollection) => {
    const count = e.detail
    // click
    if (count === 1) {
      setCurrentSelect(c)
    }
    // double click
    if (count === 2) {
      const { id } = c
      setCurrentCollection(c)
      actions.current.push(c)
      if (useRoute) {
        navigate(`/collections/${id}`)
      }
    }
  }

  return (
    <>
      <Modal visible={newCollectionVisible} onClose={toggleNewCollectionVisible}>
        <NewCollectionForm
          parentCollection={currentCollection}
          onAddCollection={toggleNewCollectionVisible}
          onBack={toggleNewCollectionVisible}
        />
      </Modal>
      <Content fullWidth fullHeight flex column style={style}>
        <Content flex>
          {!hideActions && (
            <Content flex style={{ marginRight: 20 }}>
              <Icon
                size={12}
                fill="#8590ae"
                name="park-arrow-left"
                cursor="pointer"
                onClick={() => {
                  setCurrentCollection(actions.current[actions.current.length - 1])
                  actions.current.pop()
                }}
              />
            </Content>
          )}
          {!hideBreadcrumb && (
            <Breadcrumb separator={<Icon name="park-right" />}>
              <Breadcrumb.Item
                type="button"
                onClick={() => {
                  setCurrentCollection(null)
                }}
              >
                Root
              </Breadcrumb.Item>
              {parentCollections.map(i => (
                <Breadcrumb.Item
                  type="button"
                  onClick={() => {
                    setCurrentCollection(i)
                  }}
                >
                  {i.name}
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          )}
          {!hideExtra && (
            <Content flex centered style={{ marginLeft: 'auto' }}>
              <Icon name="park-plus" cursor="pointer" onClick={toggleNewCollectionVisible} />
            </Content>
          )}
        </Content>
        <Content flex fullWidth fullHeight>
          <div ref={bodyRef} className={styles.body}>
            {!hideCollections && childrenCollections?.length === 0 && ((hideDocuments && hideNotes) || childrenItems.length === 0) && (
              <Content flex centered fullWidth fullHeight>
                No collection yet,create one?
              </Content>
            )}
            {!hideCollections &&
              childrenCollections?.map(i => (
                <CollectionItem selected={currentSelect?.id === i.id} onClick={e => handleCollectionClick(e, i)} collection={i} />
              ))}
            {!hideNotes &&
              childrenNotes.map(i => (
                <NoteItem
                  note={i}
                  onClick={note => {
                    setCurrentSelect(note)
                  }}
                />
              ))}
            {!hideDocuments &&
              childrenDocuments.map(i => (
                <DocumentItem
                  onClick={() => {
                    console.log(i)
                    setCurrentSelect(i)
                  }}
                  document={i}
                />
              ))}
          </div>
          {!hideDetails && (
            <CurrentSelectContext.Provider value={currentSelect}>
              <div className={styles.details}>
                <Details onDelete={() => setCurrentSelect(null)} />
              </div>
            </CurrentSelectContext.Provider>
          )}
        </Content>
      </Content>
    </>
  )
}

export default Collection
