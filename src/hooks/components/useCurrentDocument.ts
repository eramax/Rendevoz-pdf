import { GlobalScope } from '@/jotai/jotaiScope'
import { atom, useAtom } from 'jotai'
import { IPdfDocument } from '~/typings/data'

const currentDocumentAtom = atom<IPdfDocument | null>(null)

const useCurrentDocument = () => useAtom(currentDocumentAtom, GlobalScope)

export default useCurrentDocument
