import Id from '@/utils/id'
import { Transforms, Editor, Point, Range, Path, Element as SlateElement, Node } from 'slate'
import { CustomEditor } from '../types'
import { ParagraphElement } from '../types/commonElementTypes'
import { Positions } from '../utils/positions'

const checkIfSpacerNeeded = (element: Node) => {
  switch (element.type) {
    case 'textSelectionCard':
      return true
    case 'thought':
      return true
    case 'highlight':
      return true
    default:
      return false
  }
}
const withCustomComponent = (editor: CustomEditor) => {
  const { deleteBackward, insertText, insertBreak, deleteForward, insertNode, insertFragment, apply, insertSoftBreak } = editor
  editor.insertData = data => {
    const d = data.getData('text/plain')
    const html = data.getData('text/html')
    const parsed = new DOMParser().parseFromString(html, 'text/html')
    console.log(d, parsed)
    return
  }
  editor.insertSoftBreak = () => {
    editor.insertBreak()
  }
  editor.insertFragment = nodes => {
    nodes.forEach(i => (i.id = Id.getId()))
    insertFragment(nodes)
  }
  editor.insertNode = node => {
    const { fontSize } = editor
    node.id = Id.getId()
    node.children[0].fontSize = fontSize
    let nextPath = null
    // check if insert inside hole or spacer
    if (Positions.isStartSpacer(editor) || Positions.isEndSpacer(editor) || Positions.outermostBlock(editor)?.[0]?.type === 'hole') {
      const wrapper = Positions.outermostBlock(editor)
      if (Positions.isStartSpacer(editor)) {
        nextPath = wrapper[1]
      } else {
        nextPath = Path.next(wrapper[1])
      }
    }
    if (Positions.isInsideCommonBlock(editor)) {
      let finalInsertPath
      const nextRowPath = Positions.nextRowOfCurrentSelection(editor)
      const currPath = Path.previous(nextRowPath)
      const currNode = Editor.node(editor, currPath)
      const currElement = currNode[0]
      if (Editor.isEmpty(editor, currElement)) {
        finalInsertPath = currPath
      } else {
        finalInsertPath = nextRowPath
      }
      if (finalInsertPath) {
        const placeHolderParagraph: ParagraphElement = {
          type: 'paragraph',
          id: Id.getId(),
          children: [{ text: '' }]
        }
        if (checkIfSpacerNeeded(node)) {
          Transforms.insertNodes(
            editor,
            {
              type: 'hole',
              id: Id.getId(),
              children: [{ type: 'spacer', children: [{ text: '' }] }, node, { type: 'spacer', children: [{ text: '' }] }]
            },
            { at: finalInsertPath }
          )
        } else {
          Transforms.insertNodes(editor, node, { at: finalInsertPath })
        }
        Transforms.select(editor, Editor.end(editor, finalInsertPath))
        const placeHolderPath = Path.next(finalInsertPath)
        const { children } = editor
        if (children.length === placeHolderPath[0]) {
          Transforms.insertNodes(editor, placeHolderParagraph, { at: placeHolderPath })
        }
        return
      }
    }
    if (nextPath) {
      if (checkIfSpacerNeeded(node)) {
        Transforms.insertNodes(
          editor,
          {
            type: 'hole',
            id: Id.getId(),
            children: [{ type: 'spacer', children: [{ text: '' }] }, node, { type: 'spacer', children: [{ text: '' }] }]
          },
          { at: nextPath }
        )
      } else {
        Transforms.insertNodes(editor, node, { at: nextPath })
      }
      Transforms.select(editor, Editor.end(editor, nextPath))
    } else {
      if (checkIfSpacerNeeded(node)) {
        insertNode({
          type: 'hole',
          id: Id.getId(),
          children: [{ type: 'spacer', children: [{ text: '' }] }, node, { type: 'spacer', children: [{ text: '' }] }]
        })
      } else {
        insertNode(node)
      }
    }
  }
  editor.insertText = (text: string) => {
    const { selection } = editor
    if (selection && Range.isCollapsed(selection)) {
      if (text) {
        if (Positions.isStartSpacer(editor) || Positions.isEndSpacer(editor)) {
          const wrapper = Positions.outermostBlock(editor)
          let nextPath
          if (Positions.isStartSpacer(editor)) {
            nextPath = wrapper[1]
          } else {
            nextPath = Path.next(wrapper[1])
          }
          Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: text }] }, { at: nextPath })
          Transforms.select(editor, Editor.end(editor, nextPath))
          return
        }
      }
    }
    insertText(text)
  }

  editor.deleteBackward = (...args) => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n)
      })

      if (match) {
        const [block, path] = match
        const start = Editor.start(editor, path)
        const currentPrevious = Editor.previous(editor, { at: path })
        if (currentPrevious && Point.equals(selection.anchor, start)) {
          const [block, previousPath] = currentPrevious
          if (block.type === 'hole') {
            Transforms.removeNodes(editor, { at: path })
            Transforms.select(editor, Editor.end(editor, previousPath))
            // Transforms.removeNodes(editor, { at: path })
            return
          }
        }
        if (!Editor.isEditor(block) && SlateElement.isElement(block) && block.type === 'spacer') {
          const spacerParent = Editor.above(editor, {
            at: path
          })
          if (spacerParent) {
            const [, parentPath] = spacerParent
            const point = Editor.point(editor, parentPath, { edge: 'start' })
            if (Path.compare(point.path, path) === 0) {
              const pre = Editor.previous(editor, { at: parentPath }) ? Path.previous(parentPath) : [0, 0, 0]
              Transforms.select(editor, Editor.end(editor, pre))
              return
            }
            Transforms.removeNodes(editor, {
              at: parentPath
            })
            Transforms.insertNodes(
              editor,
              {
                type: 'paragraph',
                children: [{ text: '' }]
              },
              { at: parentPath }
            )
            return
          }
        }
        if (
          !Editor.isEditor(block) &&
          SlateElement.isElement(block) &&
          block.type !== 'paragraph' &&
          Point.equals(selection.anchor, start)
        ) {
          const newProperties: Partial<SlateElement> = {
            type: 'paragraph'
          }
          Transforms.setNodes(editor, newProperties)

          if (block.type === 'list-item') {
            Transforms.unwrapNodes(editor, {
              match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'bulleted-list',
              split: true
            })
          }

          return
        }
      }

      deleteBackward(...args)
    }
  }
  editor.deleteForward = (...args) => {
    const { selection } = editor
    console.log('deelet')
    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n)
      })
      if (match) {
        const [, path] = match
        const end = Editor.end(editor, path)
        const currentForward = Editor.next(editor, { at: path })
        if (currentForward && Point.equals(selection.anchor, end)) {
          const [block, path] = currentForward
          if (block.type === 'hole') {
            Transforms.removeNodes(editor, { at: path })
            return
          }
        }
      }
    }
    deleteForward(...args)
  }
  editor.insertBreak = () => {
    const { selection } = editor
    if (selection && Range.isCollapsed(selection)) {
      if (Positions.isInsideHole(editor)) {
        const parentHoleBlock = Positions.parentBlock(editor)
        if (parentHoleBlock) {
          let insertBreakPath
          if (Positions.isEndSpacer(editor)) {
            insertBreakPath = Path.next(parentHoleBlock[1])
          } else if (Positions.isStartSpacer(editor)) {
            insertBreakPath = parentHoleBlock[1]
          }
          Transforms.insertNodes(
            editor,
            {
              type: 'paragraph',
              id: Id.getId(),
              children: [{ text: '' }]
            },
            { at: insertBreakPath }
          )
          Transforms.select(editor, insertBreakPath)
        }
        return
      }
      const match = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n)
      })
      if (match) {
        const [, path] = match
        const currentParent = Editor.parent(editor, path)
        if (currentParent) {
          Transforms.insertNodes(editor, {
            id: Id.getId(),
            type: 'paragraph',
            children: [{ text: '' }]
          })
          return
        }
      }
    }

    insertBreak()
  }
  editor.apply = op => {
    console.log(op)
    const { emitter } = editor
    if (emitter) {
      if (op.type === 'remove_node' && op.node.type === 'subPage') {
        emitter.emit('editor', {
          type: 'deleteSubPage',
          data: {
            subPageNoteId: op.node.originId
          }
        })
      }
    }

    apply(op)
  }
  return editor
}

export default withCustomComponent
