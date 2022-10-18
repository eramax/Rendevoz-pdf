import { PdfScope } from '@/jotai/jotaiScope'
import { atom, useAtom } from 'jotai'
import { IPdfDocument } from '~/typings/data'

const pdfInfoAtom = atom<IPdfDocument | null>(null)

const usePdfInfo = () => useAtom(pdfInfoAtom, PdfScope)

export default usePdfInfo
