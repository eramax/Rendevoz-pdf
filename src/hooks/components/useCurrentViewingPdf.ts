import { GlobalScope } from '@/jotai/jotaiScope'
import { atom, useAtom } from 'jotai'
import { IPdfDocument } from '~/typings/data'

const currentViewingPdf = atom<IPdfDocument | undefined | null>(null)

const useCurrentViewingPdf = () => useAtom(currentViewingPdf, GlobalScope)

export default useCurrentViewingPdf
