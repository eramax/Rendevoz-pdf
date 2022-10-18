import { atom, useAtom } from 'jotai'

const editorVisible = atom(false)
export const useEditorVisible = () => {
  return useAtom(editorVisible)
}
