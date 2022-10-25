import { EditorEventHandler } from '@/events/editorEvent'
import useEventEmitter from '@/events/useEventEmitter'
import { useDebounceFn, useMemoizedFn, useRafFn, useUnMount } from '@/hooks'
import Id from '@/utils/id'
import classNames from 'classnames'
import { FC, FormEvent, memo, MouseEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createEditor, Editor, Transforms, Descendant, Node, Path, Element as SlateElement, Range, Point, Element, BaseEditor } from 'slate'
import { withHistory } from 'slate-history'
import { withReact, ReactEditor } from 'slate-react'
import { searchBlock } from '../dragReposition/utils/algorithm'
import { getElementId } from '../dragReposition/utils/element'
import { getDistanceBetweenPointAndElement } from '../dragReposition/utils/position'
import { getDistanceBetweenPointAndScrollableElement, isScrollable, isFullyScrolled } from '../dragReposition/utils/scroll'
import { CustomElement } from './customTypes'
import { useSelectedEditorRef } from './hooks/useSelectedEditorRef'
import InnerEditor from './InnerEditor'
import withVoid from './plugins/withVoid'
import styles from './index.module.less'
import DragHandle from './components/dragHandle'
import EditorOverlay from './components/overlay'
import { Drawer } from 'antd'
import Outline from './components/outline'
import { scrollToTarget } from './utils/positions/scroll'
import useIsDragging from './hooks/useIsDragging'
import { serializeEditor } from './utils/database/serialize'
import useNoteStore from '@/stores/note.store'
import useCurrentDocument from '../../hooks/components/useCurrentDocument'
import useDocumentStore from '@/stores/document.store'
import { withYjs, withYHistory, slateNodesToInsertDelta, YjsEditor } from '@slate-yjs/core'
import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'
import Modal from '../base/modal'
import SaveNoteDialog from '../dialogs/SaveNoteDialog'
import toast from 'react-hot-toast'
import produce from 'immer'
import { ICollection, INote } from '~/typings/data'
import useCollectionStore from '@/stores/collection.store'
import withShortcuts from './plugins/withShortcuts'
import withCustomComponent from './plugins/withCustomComponent'
import { Breadcrumb, Content } from '../base'
import withEmitter from './plugins/withEmitter'
import withHtml from './plugins/withHtml'
import { useTranslation } from 'react-i18next'

type DragHandleProps = {
  left: number
  top: number
  targetHeight: number
  targetId: number
}
const initial = [
  {
    id: Id.getId(),
    type: 'paragraph',
    children: [{ text: '' }]
  }
]

export interface EditorProps {
  onEditorInitialized?: () => void
  onChange?: (e: Descendant[]) => void
  onClick?: () => void
  initialValue?: Descendant[]
  id: string
  noteId?: number
}
export interface IEditorRef {
  insertNode: (element: CustomElement) => void
  //   foldHeading: (id: number, folded: boolean) => void
  elementPropertyChange: (element: CustomElement) => void
  outerElementPropertyChange: (element: CustomElement) => void
  resetEditor: (value: Descendant[], title?: string) => void
  jumpToBlock: (blockId: number) => void
  //   toggleMindMapLayer: Noop
}

export const EditorV1: FC<EditorProps> = memo(({ onEditorInitialized, onChange, onClick, initialValue, id, noteId }) => {
  useUnMount(() => {
    doc.destroy()
    if (note === null) {
      provider.clearData()
    } else {
      const blocks = []
      serializeEditor(editor, editor, blocks)
      blocks.forEach(i => (i.noteId = noteId))
      saveNoteAndBlocks(editor, blocks)
    }
  })
  const { t } = useTranslation()
  const currentDraggingElementPath = useRef<Path>()
  const [isDragging, setIsDragging] = useIsDragging()
  const [outlineVisible, setOutlineVisible] = useState(false)
  const [mindmapVisible, setMindmapVisible] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [saveNoteVisible, setSaveNoteVisible] = useState(false)
  const [parentNotes, setParentNotes] = useState<INote[]>([])
  const [editorValue, setEditorValue] = useState(initial)
  const [title, setTitle] = useState()
  const titleRef = useRef<string>()
  const wrapperRef = useRef<HTMLDivElement>()
  const currentDraggingRef = useRef<HTMLDivElement>()
  const draggingLayerRef = useRef<HTMLDivElement>()
  const blockElementsRef = useRef<Map<globalThis.Element, { left: number; top: number; height: number; width: number }>>(new Map())
  const blockElementsArrayRef = useRef([])
  const [dragHandle, setDragHandle] = useState<DragHandleProps>()
  const indicatorRef = useRef<{ direction?: string; id?: number }>()
  const scrollDirectionRef = useRef<string>()
  const scrollFramerId = useRef<number>()
  const emitter = useEventEmitter()
  const handler = new EditorEventHandler()
  const selectedRef = useSelectedEditorRef()
  const { getNoteById, saveNote, findParentNotes, updateNote, saveNoteAndBlocks } = useNoteStore()
  const [note, setNote] = useState<INote | null>(null)
  const [currentDocument] = useCurrentDocument()
  const { updateDocument } = useDocumentStore()
  const { addItemToCollection } = useCollectionStore()
  useEffect(() => {
    if (noteId) {
      getNoteById(noteId).then(
        note => {
          setNote(note)
          setTitle(note?.title)
          emitter.emit('editor', {
            type: 'tabDataChange',
            data: {
              id,
              noteId,
              tab: {
                title: note.title || 'Untitled'
              }
            }
          })
        },
        () => setNote(null)
      )
    }
  }, [noteId])
  useEffect(() => {
    findParentNotes(noteId).then(path => {
      setParentNotes(path)
    })
  }, [findParentNotes])
  const { sharedType, doc, provider } = useMemo(() => {
    const doc = new Y.Doc()
    const provider = new IndexeddbPersistence(String(noteId), doc)
    const sharedType = provider.doc.get('content', Y.XmlText)
    return { doc, provider, sharedType }
  }, [noteId])
  provider.on('synced', () => {
    if (sharedType._length === 0) {
      sharedType.applyDelta(slateNodesToInsertDelta(initial))
    }
    // avoid undo on synced
    editor.history = { redos: [], undos: [] }
  })
  const editor = useMemo(() => {
    return withVoid(
      withHtml(
        withCustomComponent(
          withShortcuts(
            withEmitter(withHistory(withReact(withYHistory(withYjs(createEditor(), sharedType, { autoConnect: false })))), emitter)
          )
        )
      )
    )
  }, [sharedType])
  handler.on('switchTab', data => {
    if (data.tabId === id || data.noteId === noteId) {
      selectedRef.current = {
        insertNode: handleInsertNode,
        elementPropertyChange: handleElementPropertyChange,
        outerElementPropertyChange: handleOuterElementPropertyChange,
        resetEditor: handleResetEditor,
        jumpToBlock: handleJumpToBlock
      }
    }
  })
  useEffect(() => {
    YjsEditor.connect(editor)
    return () => YjsEditor.disconnect(editor)
  }, [editor])
  useLayoutEffect(() => {
    emitter.addListener('editor', handler)
    selectedRef.current = {
      insertNode: handleInsertNode,
      elementPropertyChange: handleElementPropertyChange,
      outerElementPropertyChange: handleOuterElementPropertyChange,
      resetEditor: handleResetEditor,
      jumpToBlock: handleJumpToBlock
    }
    return () => emitter.removeListener('editor', handler)
  }, [])
  useEffect(() => {
    onEditorInitialized?.()
  }, [])
  const handleResetEditor = (value: Descendant[], title?: string) => {
    if (value) {
      editor.children = value
      editor.onChange()
    }
    setTitle(title)
  }
  const handleJumpToBlock = (blockId: number) => {
    emitter.emit(
      'editor',
      {
        type: 'selectBlock',
        data: {
          blockId
        }
      },
      true
    )
  }

  const handleInsertNode = (element: CustomElement) => {
    element.id = Id.getId()
    if (element.type === 'emoji') {
      handleInsertEmoji(element)
    } else {
      if (element.type === 'subPage') {
        // wait for switch to sub page
        setTimeout(() => Editor.insertNode(editor, element), 300)
      } else {
        Editor.insertNode(editor, element)
      }
    }
  }
  const handleInnerRendered = useMemoizedFn(() => {
    console.log('inner rendered (this is placeholder console)')
  })
  const handleInsertEmoji = element => {
    const { selection } = editor
    const isCollapsed = selection && Range.isCollapsed(selection)
    const ele = {
      type: element.type,
      name: element.name,
      children: isCollapsed ? element.children : []
    }
    if (isCollapsed) {
      Transforms.insertNodes(editor, ele)
    }
  }

  const handleElementPropertyChange = (element: CustomElement) => {
    if (element.id) {
      Transforms.setNodes(editor, element, {
        match: n => n.id === element.id
      })
    }
  }

  const handleOuterElementPropertyChange = (element: OuterElement) => {
    if (element.originId) {
      Transforms.setNodes(
        editor,
        { title: element.title },
        {
          at: [],
          match: n => n.originId && n.originId === element.originId,
          voids: true,
          mode: 'all'
        }
      )
    }
  }

  const handleDragDrop = () => {
    if (indicatorRef.current) {
      setDragHandle(undefined)
      const { direction, id } = indicatorRef.current
      let targetPath = Array.from(Node.descendants(editor)).find(i => i[0].id === id)?.[1]
      // there are two situations in drag drop
      // 1.drag to insert
      // 2.drag to reorder
      const currPath = currentDraggingElementPath.current
      // i don't know what is happening here,but it seems to be working...
      const currParentElement = Editor.node(editor, Path.parent(currPath))
      if (direction === 'top' || direction === 'bottom') {
        if (
          (Path.isAfter(currPath, targetPath) || !Path.isSibling(currPath, targetPath)) &&
          direction === 'bottom' &&
          !Path.equals(currPath, targetPath)
        ) {
          targetPath = Path.next(targetPath)
        }

        Transforms.moveNodes(editor, {
          at: currPath,
          to: targetPath
        })
      }
      if (direction === 'left' || direction === 'right') {
        const targetNode = Editor.node(editor, targetPath)
        const currNode = Editor.node(editor, currPath)
        if (targetNode[0].type !== 'column') {
          // we are dropping on normal block
          // first we need to create a column list at target path
          Transforms.removeNodes(editor, { at: targetPath })
          Transforms.insertNodes(
            editor,
            {
              type: 'columnList',
              id: Id.getId(),
              children:
                direction === 'left'
                  ? [
                      {
                        type: 'column',
                        id: Id.getId(),
                        ratio: 0.5,
                        children: [currNode[0]]
                      },
                      {
                        type: 'column',
                        id: Id.getId(),
                        ratio: 0.5,
                        children: [targetNode[0]]
                      }
                    ]
                  : [
                      {
                        type: 'column',
                        id: Id.getId(),
                        ratio: 0.5,
                        children: [targetNode[0]]
                      },
                      {
                        type: 'column',
                        id: Id.getId(),
                        ratio: 0.5,
                        children: [currNode[0]]
                      }
                    ]
            },
            {
              at: targetPath
            }
          )
          Transforms.removeNodes(editor, { at: currPath })
        } else {
          const currParentPath = Path.parent(currPath)
          // left or right should insert new column at target path first
          // if there is only one block in the column and currPath = targetPath or targetPath = currPath + 1,do nothing
          const doesColumnOnlyHaveOneChild = Editor.node(editor, currParentPath)[0].children.length === 1
          if (
            doesColumnOnlyHaveOneChild &&
            (Path.equals(targetPath, currParentPath) ||
              (Path.equals(Path.hasPrevious(targetPath) ? Path.previous(targetPath) : targetPath, currParentPath) && direction !== 'right'))
          ) {
            return
          }
          if (direction === 'right') {
            targetPath = Path.next(targetPath)
          }
          Transforms.insertNodes(
            editor,
            {
              type: 'column',
              id: Id.getId(),
              children: []
            },
            { at: targetPath }
          )
          const isMoveForward = Path.isBefore(targetPath, Path.parent(currPath)) || Path.equals(targetPath, Path.parent(currPath))
          const targetColumnListId = Editor.node(editor, Path.parent(targetPath))[0].id
          Transforms.moveNodes(editor, {
            // wtf is this ???
            at: isMoveForward ? [currPath[0], currPath[1] + 1, currPath[2]] : currPath,
            to: [...targetPath, 0]
          })
          // after insert new column,we need to recalculate the widths of all the columns
          // origin column blocks width ratio should * (1 - 1/n),new column width ratio = 1/n
          const targetColumnListPath = [editor.children.findIndex(i => i.id === targetColumnListId)]
          const targetColumnList = Editor.node(editor, targetColumnListPath)[0]
          const columnsLength = targetColumnList.children.length
          targetColumnList.children.forEach((i, idx) => {
            const columnPath = [...targetColumnListPath, idx]
            Transforms.setNodes(
              editor,
              {
                ratio: i.ratio ? i.ratio * (1 - 1 / columnsLength) : 1 / columnsLength
              },
              {
                at: columnPath
              }
            )
          })
        }
      }

      const afterMoveCurrParent = Array.from(Node.descendants(editor)).find(i => i[0].id === currParentElement[0].id)
      const afterMoveCurrParentNode = afterMoveCurrParent[0]

      if (!Path.equals(currParentElement[1], []) && Editor.isEmpty(editor, Editor.node(editor, afterMoveCurrParent[1])[0])) {
        if (afterMoveCurrParentNode.type === 'column') {
          const currColumnListNode = Editor.node(editor, Path.parent(afterMoveCurrParent[1]))
          if (currColumnListNode[0].children.length === 2) {
            const siblingColumnNode = Array.from(currColumnListNode[0].children).find(
              i => i.id !== afterMoveCurrParentNode.id
            ) as Descendant
            const items = Array.from(siblingColumnNode.children || [])
              .filter(i => i.type && i.type !== 'column')
              .map(i => i)
            Transforms.removeNodes(editor, { at: currColumnListNode[1] })
            Transforms.insertNodes(editor, items, { at: currColumnListNode[1] })
            return
          }
        }
        Transforms.removeNodes(editor, { at: afterMoveCurrParent[1] })
      }
    }
  }

  const handleStartDragging = () => {
    setIsDragging(true)
    blockElementsArrayRef.current = []
    document.body.style.cursor = 'grabbing'
    const wrapper = wrapperRef.current
    if (!wrapper) {
      return
    }
    // save all outest blocks rect for horizontally select which is currently dragging over
    Array.from(wrapper.querySelector(`[role="textbox"]`)?.children || [])
      .filter(i => i.getAttribute('data-type') === 'block')
      .forEach(i => {
        const { left, top, width, height } = i.getBoundingClientRect()
        const distance = getDistanceBetweenPointAndScrollableElement({ x: left, y: top }, wrapper)
        blockElementsArrayRef.current.push(i)
        blockElementsRef.current.set(i, {
          left: distance.left,
          top: distance.top,
          width,
          height
        })
      })
    document.addEventListener('mousemove', handleDragging2)
    document.addEventListener('mouseup', handleEndDragging)
  }

  const startScroll = (direction: string) => {
    scrollDirectionRef.current = direction
    scroll()
  }

  const scroll = () => {
    if (scrollDirectionRef.current && wrapperRef.current) {
      const step = wrapperRef.current.scrollHeight / 500
      const direction = scrollDirectionRef.current
      if (direction === 'top') {
        wrapperRef.current.scrollTop = wrapperRef.current.scrollTop - step
      } else {
        wrapperRef.current.scrollTop = wrapperRef.current.scrollTop + step
      }
      cancelAnimationFrame(scrollFramerId.current)
      scrollFramerId.current = requestAnimationFrame(scroll)
    }
  }

  const endScroll = () => {
    cancelAnimationFrame(scrollFramerId.current)
    scrollDirectionRef.current = undefined
  }

  const handleDragging = useCallback((e: MouseEvent) => {
    const draggingLayer = draggingLayerRef.current
    const wrapper = wrapperRef.current
    const currentDraggingElement = currentDraggingRef.current
    const indicator = indicatorRef.current
    if (!draggingLayer || !wrapper || !currentDraggingElement || !blockElementsRef.current.size) {
      return
    }

    if (!draggingLayer.hasChildNodes()) {
      const cloned = currentDraggingElement.cloneNode(true)
      const rect = currentDraggingElement.getBoundingClientRect()
      draggingLayer.style.opacity = '0.5'
      draggingLayer.style.width = `${rect?.width}px`
      draggingLayer.style.height = `${rect?.height}px`
      draggingLayer.appendChild(cloned)
    }
    draggingLayer.firstElementChild &&
      ((draggingLayer.firstElementChild as HTMLElement).style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`)
    if (isScrollable(wrapper)) {
      const distance = getDistanceBetweenPointAndElement(e, wrapper)
      if (distance.top < 100 && distance.top > 0 && isFullyScrolled(wrapper) !== 'top') {
        if (!scrollDirectionRef.current) {
          startScroll('top')
        }
      } else if (distance.bottom < 100 && distance.bottom > 0 && isFullyScrolled(wrapper) !== 'bottom') {
        if (!scrollDirectionRef.current) {
          startScroll('bottom')
        }
      } else {
        endScroll()
      }
    }
    const distanceToWrapper = getDistanceBetweenPointAndScrollableElement({ x: e.clientX, y: e.clientY }, wrapper)
    const currentBlock = searchBlock(Array.from(blockElementsRef.current.entries()), distanceToWrapper.top)
    if (currentBlock === -1) {
      // right now we need to check if dragging over the toppest / bottomest
      const firstBlock = blockElementsArrayRef.current[0]
      const lastBlock = blockElementsArrayRef.current[blockElementsArrayRef.current.length - 1]
      const distanceToFirstBlock = getDistanceBetweenPointAndElement(e, firstBlock)
      const distanceToLastBlock = getDistanceBetweenPointAndElement(e, lastBlock)
      if (distanceToFirstBlock.top < 0 && distanceToFirstBlock.left > 0 && distanceToFirstBlock.right > 0) {
        changeIndicator('top', getElementId(firstBlock))
        return
      }
      if (distanceToLastBlock.bottom < 0 && distanceToLastBlock.left > 0 && distanceToLastBlock.right > 0) {
        changeIndicator('bottom', getElementId(lastBlock))
        return
      }
      return
    }
    const currentBlockId = getElementId(currentBlock)
    const previousBlock = currentBlock?.previousElementSibling
    const previousBlockId = getElementId(previousBlock)
    let draggingOverColumn = null

    // right now dragging over column list,we do not determine the top / bottom direction of column list
    if (currentBlock?.getAttribute('data-spec-type') === 'columnList') {
      console.log('yes')
      const columns = currentBlock.querySelectorAll(`[data-spec-type="column"]`)
      // check if dragging over the right blank space
      const lastColumn = Array.from(columns).pop()
      if (lastColumn) {
        const distance = getDistanceBetweenPointAndElement(e, lastColumn)
        if (distance.right < 0) {
          changeIndicator('right', getElementId(lastColumn))
          return
        }
      }

      // else check if dragging between the columns or in the columns
      for (const column of columns) {
        const distance = getDistanceBetweenPointAndElement(e, column)
        if (distance.left < 0) {
          changeIndicator('left', getElementId(column))
          return
        }
        if (distance.left > 0 && distance.right > 0) {
          if (distance.top > 0 && (distance.top < currentBlock.getBoundingClientRect().height * 0.8 || distance.bottom > 0)) {
            draggingOverColumn = column
          }
          break
        }
      }
      if (draggingOverColumn) {
        const currentDraggingOverBlock = Array.from(draggingOverColumn.children).find(i => {
          const distance = getDistanceBetweenPointAndElement(e, i)
          if (distance.top > 0 && distance.bottom > 0) {
            return i
          }
        })
        // we have the dragging over block,means we are not dragging over the blank space
        if (currentDraggingOverBlock) {
          // next we need to determine the mouse pos on top 50% side or bottom 50% side
          const distance = getDistanceBetweenPointAndElement(e, currentDraggingOverBlock)
          const { height } = currentDraggingOverBlock.getBoundingClientRect()
          const currentDraggingOverBlockId = getElementId(currentDraggingOverBlock)
          if (distance.top / height < 0.5) {
            // we are on the top side and current dragging over block is the first one,so we can put the indicator above it
            if (currentDraggingOverBlock === draggingOverColumn.firstElementChild) {
              changeIndicator('top', currentDraggingOverBlockId)
              return
            } else {
              const previousBlockId = getElementId(currentDraggingOverBlock.previousElementSibling)
              // if current dragging over block is not the first child,we need to check if the indicator is under the previous block
              if (indicator && indicator.direction === 'bottom' && indicator.id === previousBlockId) {
                // do nothing here
                return
              } else {
                changeIndicator('bottom', previousBlockId)
                return
                // we need to put the indicator under the previous block
              }
            }
          } else {
            // now we are dragging over the bottom 50% side
            if (indicator && indicator.id === currentDraggingOverBlockId && indicator?.direction === 'bottom') {
              // indicator is in the right position,do nothing here
              return
            } else {
              changeIndicator('bottom', currentDraggingOverBlockId)
              return
            }
          }
        } else {
          // now we are dragging over the blank space of the column,always the bottom side
          // so we should set indicator on the bottomest block
          const lastBlock = draggingOverColumn.lastElementChild
          const lastBlockId = getElementId(lastBlock)
          changeIndicator('bottom', lastBlockId)
          return
        }
      } else {
        const distance = getDistanceBetweenPointAndElement(e, currentBlock)
        const { height } = currentBlock.getBoundingClientRect()
        if (distance.top / height > 0.8) {
          changeIndicator('bottom', currentBlockId)
          return
        }
        if (distance.top / height < 0.2) {
          if (currentBlock === wrapperRef.current?.querySelector(`[role="textbox"]`)?.firstElementChild) {
            changeIndicator('top', currentBlockId)
            return
          } else {
            changeIndicator('bottom', previousBlockId)
            return
          }
        }
      }
    } else {
      // right now dragging over normal block,direction can be top / right / bottom / left
      // eslint-disable-next-line no-unsafe-optional-chaining
      const distance = getDistanceBetweenPointAndElement(e, currentBlock)
      const { height } = currentBlock.getBoundingClientRect()
      // right direction and left direction are more important on noraml block
      // bottom 50% -> direction is bottom of current block      top 50% -> direction is bottom of previous block,if there is no previous block,direction is top of current block
      if (distance.right < 0) {
        // direction is right
        if (getElementId(currentBlock) === getElementId(currentDraggingElement)) {
          return
        }
        changeIndicator('right', currentBlockId)
        return
      }
      if (distance.left < 0) {
        if (getElementId(currentBlock) === getElementId(currentDraggingElement)) {
          return
        }
        changeIndicator('left', currentBlockId)
        return
      }
      if (distance.top / height < 0.5) {
        if (currentBlock === currentBlock.parentElement?.firstElementChild) {
          changeIndicator('top', currentBlockId)
          return
        } else {
          changeIndicator('bottom', previousBlockId)
          return
        }
      } else {
        if (indicator && indicator.direction === 'bottom' && indicator.id === currentBlockId) {
          return
          // do nothing here
        } else {
          changeIndicator('bottom', currentBlockId)
          return
        }
      }
    }
  }, [])

  const throttledHandleDragging = useRafFn(handleDragging)

  const handleDragging2 = useMemoizedFn((e: MouseEvent) => {
    try {
      throttledHandleDragging(e)
    } catch (e) {
      console.log(e)
    }
    e.preventDefault()
  })

  const handleEndDragging = useMemoizedFn(() => {
    document.body.style.cursor = 'auto'
    document.removeEventListener('mousemove', handleDragging2)
    document.removeEventListener('mouseup', handleEndDragging)
    blockElementsRef.current.clear()
    currentDraggingRef.current = undefined
    try {
      handleDragDrop()
    } catch (e) {
      console.log(e)
    }
    setIsDragging(false)
    changeIndicator(null)
    endScroll()
  })

  const handleDividerDragEnd = useMemoizedFn(
    (previousColumnWidthRatio: number, previousColumnPath: Path, nextColumnWidthRatio: number, nextColumnPath: Path) => {
      setDragHandle(undefined)
      setIsDragging(false)
      Transforms.setNodes(
        editor,
        {
          ratio: previousColumnWidthRatio
        },
        {
          at: previousColumnPath
        }
      )
      Transforms.setNodes(
        editor,
        {
          ratio: nextColumnWidthRatio
        },
        {
          at: nextColumnPath
        }
      )
    }
  )

  const handleDividerDragStart = useMemoizedFn(() => {
    setIsDragging(true)
  })

  const handleMouseEnter = useMemoizedFn((e: MouseEvent, element) => {
    if (!isDragging && !overlayVisible) {
      currentDraggingRef.current = e.currentTarget as HTMLDivElement
      currentDraggingElementPath.current = ReactEditor.findPath(editor, element)
      const rect = wrapperRef.current?.getBoundingClientRect()
      const targetRect = e.currentTarget.getBoundingClientRect()
      setDragHandle({
        left: targetRect.x - rect?.x,
        top: targetRect.y - rect?.y + wrapperRef.current?.scrollTop,
        targetId: element.id,
        targetHeight: targetRect.height
      })
    }
  })

  const handleToggleMindmap = useMemoizedFn(() => {
    setMindmapVisible(!mindmapVisible)
  })

  const handleToggleOutline = useMemoizedFn(() => {
    setOutlineVisible(!outlineVisible)
  })

  const changeIndicator = (direction: string | null, id?: number) => {
    if (direction === null) {
      indicatorRef.current = undefined
      emitter.emit('editor', {
        type: 'indicatorChange',
        data: {
          direction: undefined,
          id: undefined
        }
      })
      return
    }
    indicatorRef.current = { direction, id }
    emitter.emit('editor', {
      type: 'indicatorChange',
      data: {
        direction,
        id
      }
    })
  }

  const { run: debouncedChangeEditorValue } = useDebounceFn(
    value => {
      setEditorValue(value)
    },
    { wait: 300 }
  )

  const handleEditorValueChange = useMemoizedFn(value => {
    debouncedChangeEditorValue(value)
  })

  const handleTitleChange = useMemoizedFn((e: FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || 'Untitled'
    titleRef.current = text
    if (note) {
      updateNote({
        id: noteId,
        title: text
      })
    }
    emitter.emit('editor', {
      type: 'tabDataChange',
      data: {
        id,
        noteId,
        tab: {
          title: text
        }
      }
    })
    emitter.emit('editor', {
      type: 'outerElementPropertyChange',
      data: {
        element: {
          originId: noteId,
          title: text
        }
      }
    })
  })

  const handleOpenSave = useMemoizedFn(() => {
    const title = titleRef.current
    if (note) {
      toast.error('Note has been saved!')
      return
    }
    if (title && title !== '' && title !== 'Untitled') {
      setSaveNoteVisible(true)
    } else {
      toast.error("Title can't be empty!")
    }
  })

  const handleSave = (confirm: boolean, collection: ICollection) => {
    toast.success('Note saved')
    setSaveNoteVisible(false)
    if (currentDocument && noteId && confirm) {
      const newDoc = produce(currentDocument, d => {
        d.noteIds = d?.noteIds || []
        if (!d.noteIds.includes(noteId)) {
          d.noteIds.push(noteId)
        }
      })
      updateDocument(newDoc)
    }
    addItemToCollection(
      {
        type: 'note',
        id: noteId
      },
      collection.id
    )
    const flattened = []
    const title = titleRef.current
    serializeEditor(editor, editor, flattened)
    saveNote({
      id: noteId,
      title
    })?.then(note => {
      setNote(note)
    })
    flattened.forEach(i => {
      i.noteId = noteId
      if (['column', 'columnList'].includes(i.type)) {
        delete i.children
        delete i.plain
      }
      if (i.subBlockIds.length === 0) {
        delete i.subBlockIds
      }
    })
    // saveNoteAndBlocks(editor, flattened, title)
  }

  const handleAddSubPage = useMemoizedFn(() => {
    if (note === null) {
      toast.error('You have to save current note before adding new sub page!')
    } else {
      const subPageId = Id.getId()
      emitter.emit('editor', {
        type: 'insertNode',
        data: {
          element: {
            type: 'subPage',
            originId: subPageId,
            children: [{ text: '' }]
          }
        }
      })
      emitter.emit('editor', {
        type: 'insertTab',
        data: {
          noteId: subPageId,
          isNew: true,
          parentNoteId: noteId
        }
      })
    }
  })

  return (
    <div
      className={styles.Editor}
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        marginBottom: 50
      }}
    >
      <Modal visible={saveNoteVisible} onClose={() => setSaveNoteVisible(false)}>
        <SaveNoteDialog onCancel={() => setSaveNoteVisible(false)} onSubmit={handleSave} />
      </Modal>
      {parentNotes.length > 1 && (
        <Content style={{ paddingLeft: '14px' }}>
          <Breadcrumb>
            {parentNotes.map(i => (
              <Breadcrumb.Item
                key={i.title}
                onClick={() => {
                  emitter.emit('editor', {
                    type: 'switchTab',
                    data: {
                      noteId: i.id
                    }
                  })
                }}
                type="button"
              >
                {i.title || t('editor.untitled')}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </Content>
      )}
      <div ref={wrapperRef} className={styles.Wrapper}>
        {/* <MouseSelection onSelectionChange={() => {}} onSelectionEnd={() => {}} eventsElement={wrapperRef.current} /> */}
        <DragHandle
          onMouseDown={handleStartDragging}
          // onClick={e => {
          //   setOverlayVisible(!overlayVisible)
          //   emitter.emit('editor', {
          //     type: 'toggleOverlay',
          //     data: {
          //       top: dragHandle?.top + wrapperRef.current?.getBoundingClientRect()?.top,
          //       left: dragHandle?.left + wrapperRef.current?.getBoundingClientRect()?.left,
          //       content: 'dragHandleMenu'
          //     }
          //   })
          //   e.stopPropagation()
          // }}
          {...dragHandle}
          visible={!isDragging && !outlineVisible && !mindmapVisible}
        />
        <div className={classNames(styles.InnerEditorWrapper, mindmapVisible && styles.MindmapVisible)}>
          <InnerEditor
            scrollElement={wrapperRef.current}
            title={title}
            noteId={noteId}
            onTitleChange={handleTitleChange}
            editor={editor}
            onRendered={handleInnerRendered}
            defaultValue={initial}
            onChange={handleEditorValueChange}
            onDividerDragEnd={handleDividerDragEnd}
            onDividerDragStart={handleDividerDragStart}
            onBlockMouseEnter={handleMouseEnter}
            onSave={handleOpenSave}
            onAddSubPage={handleAddSubPage}
            onToggleMindmap={handleToggleMindmap}
            onToggleOutline={handleToggleOutline}
            isDragging={isDragging}
          />
        </div>
      </div>
      <EditorOverlay
        onVisiblityChange={visibility => {
          setOverlayVisible(visibility)
          if (overlayVisible) {
            setDragHandle(undefined)
          }
        }}
        visible={overlayVisible}
      />
      <div style={{ position: 'fixed', inset: 0, zIndex: 999, pointerEvents: 'none' }} role="dragging-layer">
        <div style={{ pointerEvents: 'auto', position: 'relative', zIndex: 0 }}>
          {isDragging && <div style={{ position: 'absolute', top: 0, left: 0 }} ref={draggingLayerRef}></div>}
        </div>
      </div>
    </div>
  )
})
