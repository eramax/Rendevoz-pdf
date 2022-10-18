// A React context for sharing the Pdf note object

import { CustomLabel, ILabel, PdfNoteData } from '@/../typings/data'
import { atom, PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { focusAtom } from 'jotai/optics'
import { splitAtom } from 'jotai/utils'
import { useMemo } from 'react'

export type SplitAtomAction<Item> =
  | {
      type: 'remove'
      atom: PrimitiveAtom<Item>
    }
  | {
      type: 'insert'
      value: Item
      before?: PrimitiveAtom<Item>
    }
  | {
      type: 'move'
      atom: PrimitiveAtom<Item>
      before?: PrimitiveAtom<Item>
    }
export const PdfNoteAtom = atom<PdfNoteData>({ labels: [] })

export const PdfLabelsAtoms = splitAtom(
  focusAtom(PdfNoteAtom, optic => optic.prop('labels')),
  item => item.id
)

export const usePdfNote = () => useAtom(PdfNoteAtom)



export const usePdfLabels = (
  pageIndex: number,
  type: string
): [PrimitiveAtom<CustomLabel>[], (update: SplitAtomAction<CustomLabel>) => void] => {
  const dispatch = useSetAtom(PdfLabelsAtoms)
  const labelAtomsAtom = useMemo(
    () => atom(get => get(PdfLabelsAtoms).filter(i => get(i).type === type && get(i).page === pageIndex)),
    [pageIndex]
  )
  const atoms = useAtomValue(labelAtomsAtom)
  return [atoms, dispatch]
}
