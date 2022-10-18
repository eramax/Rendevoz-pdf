import { ITextSelectionLabel } from '@/../typings/data'
import { atom, useAtom } from 'jotai'

const textSelection = atom<ITextSelectionLabel | null>(null)
export const useCurrentTextSelection = () => useAtom(textSelection)
