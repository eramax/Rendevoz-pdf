import useDb from '@/hooks/stores/useDb'
import { atom, useAtom } from 'jotai'
import { useMemo } from 'react'
import { ILabel } from '~/typings/data'
import BaseStore from './base.store'

const labelAtom = atom(new Map<number, ILabel>())

const useLabelStore = () => {
  const [labels, setLabels] = useAtom(labelAtom)
  const db = useDb('labels')
  const { bulkAdd } = BaseStore
  const getLabelsByDocumentId = (documentId: number) => {
    const targetLabels = Array.from(labels.values()).filter(i => i.documentId === documentId)
    if (targetLabels.length) {
      return targetLabels
    } else {
      return db
        .where('documentId')
        .equals(documentId)
        .toArray()
        .then(data => {
          setLabels(bulkAdd(data, labels))
        })
        .then(() => Array.from(labels.values()).filter(i => i.documentId === documentId))
    }
  }
  const insertLabel = (label: ILabel) => {}

  const bulkInsertLabel = (ls: ILabel[]) => {
    if (ls?.length) {
      db.bulkPut(ls)
      setLabels(bulkAdd(ls, labels))
    }
  }
  return useMemo(
    () => ({
      getLabelsByDocumentId,
      insertLabel,
      bulkInsertLabel
    }),
    [labels]
  )
}

export default useLabelStore
