import { atom, useAtom } from 'jotai'
import { Descendant } from 'slate'

const markdownEditorValue = atom<Descendant[]>([{ type: 'paragraph', children: [{ text: '' }] }])

const useEditorValue = () => {
  return useAtom(markdownEditorValue)
}
export default useEditorValue
