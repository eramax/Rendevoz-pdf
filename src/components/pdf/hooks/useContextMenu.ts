import { atom, useAtom } from 'jotai'

const contextMenuOpen = atom(false)
export const useContextMenu = () => {
  return useAtom(contextMenuOpen)
}
