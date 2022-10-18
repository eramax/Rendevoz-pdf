import { PdfScope } from '@/jotai/jotaiScope'
import { atom, useAtom } from 'jotai'

const collapsedAtom = atom(false)

const useCollapsed = () => useAtom(collapsedAtom, PdfScope)

export default useCollapsed
