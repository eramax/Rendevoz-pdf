import { Editor, Path, Range } from 'slate'
import { CustomEditor } from '../../customTypes'

export interface ISpacerPosition {
  isStartSpacer: (editor: CustomEditor) => boolean | undefined
  isEndSpacer: (editor: CustomEditor) => boolean | undefined
}

export const SpacerPosition: ISpacerPosition = {
  isStartSpacer: editor => {
    const { selection } = editor
    const match = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n)
    })
    if (match && selection && Range.isCollapsed(selection)) {
      const [block, path] = match
      if (block.type === 'spacer') {
        if (Editor.isStart(editor, selection.anchor, Path.parent(path))) {
          return true
        }
      }
    }
  },
  isEndSpacer: editor => {
    const { selection } = editor
    const match = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n)
    })
    if (match && selection && Range.isCollapsed(selection)) {
      const [block, path] = match
      if (block.type === 'spacer') {
        if (Editor.isEnd(editor, selection.anchor, Path.parent(path))) {
          return true
        }
      }
    }
  }
}
