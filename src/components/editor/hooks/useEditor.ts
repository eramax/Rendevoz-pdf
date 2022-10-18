import { atom, useAtom } from 'jotai'
import { ReactEditor } from 'slate-react'

const editor = atom<ReactEditor | null>(null)
export const useEditor = () => {
  return useAtom(editor)
}
