import { Editor, Element, Node } from 'slate'
import { CustomEditor } from '../../types'

export const serializeEditor = (node: Element, editor: CustomEditor, result: []) => {
  if (node.children?.length && !Editor.isEditor(node) && !Editor.isInline(editor, node)) {
    result.push(node)
  }
  if (node.type === 'hole') {
    return
  }
  node.children?.forEach(i => {
    node.subBlockIds = node.subBlockIds || []
    i.id && node.subBlockIds.push(i.id)
    const cloned = structuredClone(i)
    cloned.plain = Node.string(cloned)
    if (node.id) {
      cloned.parentId = node.id
    }
    serializeEditor(cloned, editor, result)
  })
  return result
}
