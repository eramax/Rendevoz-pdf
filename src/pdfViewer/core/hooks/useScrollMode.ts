import { atom, useAtom } from 'jotai'
import { PdfViewInnerScope } from '../Provider'
import { ScrollMode } from '../types/layout'

const scrollModeAtom = atom<ScrollMode>('vertical')

export const useScrollMode = () => useAtom(scrollModeAtom, PdfViewInnerScope)
