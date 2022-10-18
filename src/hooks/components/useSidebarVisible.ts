import { GlobalScope } from '@/jotai/jotaiScope'
import { atom, useAtom } from 'jotai'

const sidebarVisible = atom(true)

const useSidebarVisible = () => useAtom(sidebarVisible, GlobalScope)

export default useSidebarVisible