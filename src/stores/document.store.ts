import { GlobalScope } from '@/jotai/jotaiScope'
import { DefaultPaginationLimit } from '@/consts/pagination'
import useDb from '@/hooks/stores/useDb'
import { PaginationParams } from '@/types'
import { atom, useAtom } from 'jotai'
import { orderBy } from 'lodash'
import { useMemo } from 'react'
import useSWR from 'swr'
import { IPdfDocument } from '~/typings/data'
import BaseStore from './base.store'

export const documentsAtom = atom<Map<number, IPdfDocument>>(new Map())

const useDocumentStore = () => {
  const [documents, setDocuments] = useAtom(documentsAtom, GlobalScope)
  const database = useDb('documents')
  const { orderedData, add, get, bulkAdd, update, remove } = BaseStore

  const all: IPdfDocument[] = orderedData(documents).filter(i => !i.deletedAt)

  const fetchItems = async ({ limit = DefaultPaginationLimit, offset = 0 }: PaginationParams): Promise<IPdfDocument[] | undefined> => {
    const count = await database.count()
    if (count === documents.size) {
      return orderedData(documents).slice(offset, limit + offset)
    }
    try {
      const res: IPdfDocument[] = await database.toArray()
      const newMap = new Map(res.map(i => [i.id, i]))
      setDocuments(newMap)
      return res.slice(offset, offset + limit)
    } catch (e) {
      console.log(e)
    }
  }
  const fetchItemsByIds = async (ids: number[]) => {
    const toBeFetchedIds = ids.filter(id => !documents.has(id))
    try {
      const items = await database.where('id').anyOf(toBeFetchedIds).toArray()
      setDocuments(bulkAdd(items, documents))
      return orderBy(
        all.filter(i => ids.includes(i.id)),
        'createdAt',
        'desc'
      )
    } catch (err) {
      console.error(err)
    }
  }
  const insertDocument = (document: IPdfDocument) => {
    document = {
      ...document,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    setDocuments(add(document, documents))
    database.add(document)
  }
  const updateDocument = (document: IPdfDocument) => {
    setDocuments(update(document, documents))
    database.put(document, document.id)
  }
  // fake delete
  const deleteDocumentById = (documentId: number) => {
    const document = get(documentId, documents)
    const newDoc: IPdfDocument = {
      ...document,
      deleted: true,
      deletedAt: Date.now()
    }
    setDocuments(update(newDoc, documents))
    database.put(newDoc, document?.id)
  }
  const recentlyRead = orderBy(
    all.filter(i => i.lastReadAt),
    'lastReadAt',
    'desc'
  )
  const mostNotes = orderBy(
    all.filter(i => i.totalNoteNumber),
    'totalNoteNumber',
    'desc'
  )
  const recentlyCreated = orderBy(all, 'createdAt', 'desc')
  const getDocumentById = (id: number) => {
    return all.find(i => i.id === id)
  }
  useSWR('/api/all/documents', fetchItems)
  return useMemo(
    () => ({
      documents: documents,
      all,
      fetchItems,
      fetchItemsByIds,
      recentlyRead,
      recentlyCreated,
      mostNotes,
      insertDocument,
      updateDocument,
      getDocumentById,
      deleteDocumentById
    }),
    [documents]
  )
}
export default useDocumentStore
