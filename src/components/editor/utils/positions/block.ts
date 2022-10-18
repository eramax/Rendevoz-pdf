import { Ancestor, Editor, Node, NodeEntry, Path, Point, Range } from 'slate'
import { Positions } from '.'
import { CustomEditor } from '../../customTypes'

export interface IBlockPosition {
  outermostBlock: (editor: CustomEditor) => NodeEntry<Ancestor> | undefined
  parentBlock: (editor: CustomEditor) => NodeEntry<Node> | undefined
  isInsideCommonBlock: (editor: CustomEditor) => boolean
  isInsideHole: (editor: CustomEditor) => boolean
  nextRowOfCurrentSelection: (editor: CustomEditor) => Path | undefined
}
export const BlockPosition: IBlockPosition = {
  outermostBlock: editor => {
    const match = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
      mode: 'all',
      voids: true
    })
    return match
  },
  parentBlock: editor => {
    const { selection } = editor
    if (selection && Range.isCollapsed(selection)) {
      let parentPath = Path.parent(selection.anchor.path)
      if (Positions.isInsideHole(editor)) {
        parentPath = Path.parent(Path.parent(selection.anchor.path))
      }
      return Editor.node(editor, parentPath)
    }
  },
  isInsideCommonBlock: editor => {
    const { selection } = editor
    console.log(selection)
    if (selection && Range.isCollapsed(selection)) {
      const node = Editor.node(editor, selection?.anchor?.path, { depth: 1 })
      console.log(node)
      if (node) {
        console.log(true)
        return true
      }
    }
    return false
  },
  isInsideHole: editor => {
    if (Array.from(Editor.levels(editor, { voids: true })).some(i => i[0].type === 'hole')) {
      return true
    }
    return false
  },
  nextRowOfCurrentSelection: editor => {
    const { selection } = editor
    if (selection && Range.isCollapsed(selection)) {
      const endPoint = Point.isAfter(selection?.anchor, selection?.focus) ? selection?.anchor : selection?.focus
      const parentPath = Path.parent(endPoint.path)
      let nextPath = Path.next(parentPath)
      if (Positions.isInsideHole(editor)) {
        nextPath = Path.next(Path.parent(parentPath))
      }
      return nextPath
    }
  }
}
