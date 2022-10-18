import { GlobalScope } from '@/jotai/jotaiScope'
import useDb from '@/hooks/stores/useDb'
import Id from '@/utils/id'
import { atom, useAtom, useAtomValue } from 'jotai'
import { orderBy } from 'lodash'
import { useMemo } from 'react'
import useSWR from 'swr'
import { ICollection, ICollectionItem, IPdfDocument } from '~/typings/data'
import useDocumentStore from './document.store'
import BaseStore from './base.store'
import produce from 'immer'
import useNoteStore from './note.store'

const { orderedData } = BaseStore

const collectionsAtom = atom<Map<number, ICollection>>(new Map())

const allAtom = atom(get => orderedData(get(collectionsAtom)))

const rootCollectionsAtom = atom(get =>
  orderBy(
    get(allAtom).filter(i => i.parentId === 0),
    'updatedAt',
    'desc'
  )
)
const useCollectionStore = () => {
  const [collections, setCollections] = useAtom(collectionsAtom, GlobalScope)
  const database = useDb('collections')
  const { fetchItemsByIds, getDocumentById, all: documents } = useDocumentStore()
  const { getNoteById } = useNoteStore()
  const { add, get, update } = BaseStore

  const all = useAtomValue(allAtom, GlobalScope)

  const rootCollections = useAtomValue(rootCollectionsAtom, GlobalScope)

  const getChildrenCollections = (rootId?: number) => {
    return orderBy(
      all.filter(i => i.parentId === (rootId || 0)),
      'updatedAt',
      'desc'
    )
  }
  const getChildrenDocuments = (rootId?: number) => {
    const collection = get(rootId, collections)
    return collection?.documents?.map(i => getDocumentById(i)).filter(i => !!i)
  }
  const getChildrenItems = (collectionId: number) => {
    return getCollectionById(collectionId).then(collection => {
      const items = collection.items
      const promises: Promise<any>[] = []
      items?.forEach(i => {
        if (i.id) {
          if (i.type === 'document') {
            promises.push(Promise.resolve(getDocumentById(i.id)))
          }
          if (i.type === 'note') {
            promises.push(getNoteById(i.id))
          }
        }
      })
      return Promise.all(promises)
    })
  }
  const one = (id: number) => {
    return collections.get(id)
  }
  const fetchChildrenCollectionsAndDocuments = async (
    rootId: number
  ): Promise<{ documents?: IPdfDocument[]; collections?: ICollection[] }> => {
    const rootCollection = get(rootId, collections)
    if (rootCollection) {
      const childrenDocuments = await fetchItemsByIds(rootCollection.documents)
      const childrenCollections = orderBy(
        all.filter(i => i.parentId === rootId),
        'updatedAt',
        'desc'
      )
      return {
        documents: childrenDocuments,
        collections: childrenCollections
      }
    }
    return {}
  }

  const fetchCollections = async () => {
    try {
      const allCollections = await database.toArray()
      setCollections(new Map(allCollections.map(i => [i.id, i])))
    } catch (err) {
      console.error(err)
    }
  }
  const addDocumentToCollection = async (documentId: number, collectionId: number) => {
    const temp = new Map(collections)
    const collection = get(collectionId, temp) || (await database.get(collectionId))
    collection?.documents.push(documentId)
    collection.updatedAt = Date.now()
    add(collection, temp)
    setCollections(temp)
    database.put(collection, collectionId)
  }

  const addItemToCollection = (item: ICollectionItem, collectionId: number) => {
    return getCollectionById(collectionId).then(
      collection => {
        const newCollection = produce(collection, draft => {
          draft.items = draft.items || []
          draft.items.push(item)
        })
        setCollections(update(newCollection, collections))
        database.put(newCollection)
      },
      reject => {
        console.error("Can't add item to collection,error: ", reject)
      }
    )
  }

  const getCollectionById = (collectionId: number): Promise<ICollection> => {
    return new Promise((resolve, reject) => {
      const collection = get(collectionId, collections)
      if (collection) {
        resolve(collection)
      } else {
        database.get(collectionId).then(c => {
          if (c) {
            resolve(c)
            setCollections(add(c, collections))
          } else {
            reject("Collection don't exist!")
          }
        })
      }
    })
  }
  const findParentCollections = (collection: ICollection) => {
    let innerCollection = collection
    const parentCollectionsList = [collection]
    while (innerCollection?.parentId !== 0) {
      const parent = collections.get(innerCollection.parentId)
      if (parent && innerCollection !== parent) {
        innerCollection = parent
        parentCollectionsList.unshift(parent)
      } else {
        throw new Error('no parent collection found!')
      }
    }
    return parentCollectionsList
  }
  const findSubCollections = (collection: ICollection) => {
    const subCollectionsList = []
    const find = (collection: ICollection, list: any[]) => {
      all
        .filter(i => i.parentId === collection.id)
        .map(i => {
          if (list) {
            list.push(i)
            find(i, list)
          }
        })
    }
    find(collection, subCollectionsList)
    return subCollectionsList
  }
  const addCollection = (collection: ICollection) => {
    const c: ICollection = {
      ...collection,
      id: collection?.id || Id.getId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      parentId: collection?.parentId || 0,
      documents: collection?.documents || []
    }
    database.put(c)
    setCollections(add(c, collections))
    return c
  }
  useSWR('/api/all/collections', fetchCollections)
  return useMemo(
    () => ({
      all,
      rootCollections,
      one,
      fetchChildrenCollectionsAndDocuments,
      fetchCollections,
      addDocumentToCollection,
      findParentCollections,
      addCollection,
      getChildrenCollections,
      getChildrenDocuments,
      addItemToCollection,
      getChildrenItems,
      findSubCollections
    }),
    [collections, documents]
  )
}

export default useCollectionStore
