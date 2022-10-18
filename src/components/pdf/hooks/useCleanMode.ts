import { PdfScope } from '@/jotai/jotaiScope'
import { atom, useAtom } from 'jotai'

const cleanMode = atom(false)

const useCleanMode = () => useAtom(cleanMode, PdfScope)

export default useCleanMode
