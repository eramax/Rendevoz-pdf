import Id from '@/utils/id'
import { Editor, Range, Element as SlateElement, Transforms } from 'slate'
import SHORTCUTS from '../consts/shortcuts'
import { BulletedListElement } from '../customTypes'
import { CustomEditor } from '../types'

const withShortcut = (editor: CustomEditor) => {
  const { insertText } = editor
  editor.insertText = (text: string) => {
    const { selection } = editor
    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection
      const block = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n)
      })
      const path = block ? block[1] : []
      const start = Editor.start(editor, path)
      const range = { anchor, focus: start }
      const beforeText = Editor.string(editor, range)
      const type = SHORTCUTS[beforeText]

      if (type) {
        Transforms.select(editor, range)
        Transforms.delete(editor)
        const newProperties: Partial<SlateElement> = {
          type,
          id: Id.getId()
        }
        Transforms.setNodes<SlateElement>(editor, newProperties, {
          match: n => Editor.isBlock(editor, n)
        })
        if (type === 'list-item') {
          const list: BulletedListElement = {
            type: 'bulleted-list',
            children: []
          }
          Transforms.wrapNodes(editor, list, {
            match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'list-item'
          })
        }

        return
      }
    }
    insertText(text)
  }
  return editor
}

export default withShortcut