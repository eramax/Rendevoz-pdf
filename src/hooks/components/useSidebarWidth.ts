import { GlobalScope } from '@/jotai/jotaiScope'
import { atom, useAtom } from 'jotai'

const sidebarWidthAtom = atom(240)

const useSidebarWidth = () => useAtom(sidebarWidthAtom, GlobalScope)

export default useSidebarWidth
