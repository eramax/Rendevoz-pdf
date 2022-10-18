import Id from '@/utils/id'
import React, { cloneElement, CSSProperties, FC, memo, useMemo, useCallback, useEffect, useRef, useState, MouseEvent } from 'react'
import styles from './index.module.less'
import { createEditor, Descendant, Editor, Element, Node, Path, Point, Range, Transforms } from 'slate'
import { Editable, ReactEditor, RenderElementProps, Slate, withReact } from 'slate-react'
import { mergeRefs } from '@/hooks/utils/useMergedRef'
import { useMemoizedFn, usePrevious, useRafState } from '@/hooks'
import { withHistory } from 'slate-history'
import { AnimatePresence, motion, PanInfo } from 'framer-motion'
import classNames from 'classnames'
import SHORTCUTS from '../editor/consts/shortcuts'
import { CustomEditor, BulletedListElement } from '../editor/customTypes'
import { Positions } from '../editor/utils/positions'
import Icon from '../base/Icon'
import { getDistanceBetweenPointAndElement } from './utils/position'
import useRafFn from '@/hooks/utils/useRafFn'
import { getDistanceBetweenPointAndScrollableElement, isFullyScrolled, isScrollable } from './utils/scroll'
import { getElementId } from './utils/element'
import { searchBlock } from './utils/algorithm'
import useWhyDidYouUpdate from '@/hooks/utils/useWhyUpdate'
import { CustomElement } from '../editor/types'
import useEventEmitter from '@/events/useEventEmitter'
import { EditorEventHandler, IndicatorChangeEvent } from '@/events/editorEvent'
import { Noop } from '@/common/types'

type DragHandleProps = {
  left: number
  top: number
  targetId: number
}
const initial = [
  {
    id: 345,
    type: 'paragraph',
    children: [{ text: '' }]
  }
]
export const TestEditor = () => {
  const editor = useMemo(() => withShortcuts(withHistory(withReact(createEditor()))), [])
  const currentDraggingElementPath = useRef<Path>()
  const [isDragging, setIsDragging] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>()
  const currentDraggingRef = useRef<HTMLDivElement>()
  const draggingLayerRef = useRef<HTMLDivElement>()
  const blockElementsRef = useRef<Map<globalThis.Element, { left: number; top: number; height: number; width: number }>>(new Map())
  const [dragHandle, setDragHandle] = useState<DragHandleProps>()
  const indicatorRef = useRef<{ direction?: string; id?: number }>()
  const scrollDirectionRef = useRef<string>()
  const scrollFramerId = useRef<number>()
  const emitter = useEventEmitter()

  const handleDragDrop = () => {
    if (indicatorRef.current) {
      const { direction, id } = indicatorRef.current
      let targetPath = Array.from(Node.descendants(editor)).find(i => i[0].id === id)?.[1]
      // there are two situations in drag drop
      // 1.drag to insert
      // 2.drag to reorder
      const currPath = currentDraggingElementPath.current
      console.log(currPath, targetPath)
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
            const items = Array.from(Node.elements(siblingColumnNode))
              .filter(i => i[0].type && i[0].type !== 'column')
              .map(i => i[0])
            console.log(items)
            Transforms.removeNodes(editor, { at: currColumnListNode[1] })
            Transforms.insertNodes(editor, items, { at: currColumnListNode[1] })
            return
          }
        }
        Transforms.removeNodes(editor, { at: afterMoveCurrParent[1] })
      }
    }

    setDragHandle(undefined)
  }
  const handleStartDragging = () => {
    setIsDragging(true)
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
  const handleDragging = useMemoizedFn((e: MouseEvent) => {
    e.preventDefault()
    emitter.emit('editor', { type: 'forceUpdate' })
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
    } else {
      draggingLayer.firstElementChild &&
        ((draggingLayer.firstElementChild as HTMLElement).style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`)
    }

    if (isScrollable(wrapper)) {
      const distance = getDistanceBetweenPointAndElement(e, wrapper)
      if (distance.top < 100 && distance.top > 0 && isFullyScrolled(wrapper) !== 'top') {
        if (scrollDirectionRef.current) {
          return
        }
        startScroll('top')
        return
      } else if (distance.bottom < 100 && distance.bottom > 0 && isFullyScrolled(wrapper) !== 'bottom') {
        if (scrollDirectionRef.current) {
          return
        }
        startScroll('bottom')
        return
      } else {
        endScroll()
      }
    }
    const distanceToWrapper = getDistanceBetweenPointAndScrollableElement({ x: e.clientX, y: e.clientY }, wrapper)
    const currentBlock = searchBlock(Array.from(blockElementsRef.current.entries()), distanceToWrapper.top)
    if (currentBlock === -1) {
      return
    }
    const currentBlockId = getElementId(currentBlock)
    const previousBlock = currentBlock?.previousElementSibling
    const previousBlockId = getElementId(previousBlock)
    let draggingOverColumn = null
    // right now dragging over column list,we do not determine the top / bottom direction of column list
    if (currentBlock?.getAttribute('data-spec-type') === 'columnList') {
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
        if (currentBlock === wrapper.querySelector(`[role="textbox"]`)?.firstElementChild) {
          changeIndicator('top', currentBlockId)
          return
        } else {
          changeIndicator('bottom', previousBlockId)
          return
        }
      } else {
        if (indicator && indicator.direction === 'bottom' && indicator.id === currentBlockId) {
          // do nothing here
        } else {
          changeIndicator('bottom', currentBlockId)
          return
        }
      }
    }
  })
  const throttledHandleDragging = useRafFn(handleDragging)
  const handleDragging2 = (e: MouseEvent) => {
    throttledHandleDragging(e)
    e.preventDefault()
  }
  const handleEndDragging = useMemoizedFn(() => {
    document.body.style.cursor = 'auto'
    document.removeEventListener('mousemove', handleDragging2)
    document.removeEventListener('mouseup', handleEndDragging)
    blockElementsRef.current.clear()
    currentDraggingRef.current = undefined
    handleDragDrop()
    setIsDragging(false)
    changeIndicator(null)
    setDragHandle(undefined)
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
    if (!isDragging) {
      currentDraggingRef.current = e.currentTarget
      currentDraggingElementPath.current = ReactEditor.findPath(editor, element)
      const rect = wrapperRef.current?.getBoundingClientRect()
      setDragHandle({
        left: e.currentTarget.getBoundingClientRect().x - rect?.x,
        top: e.currentTarget.getBoundingClientRect().y - rect?.y + wrapperRef.current?.scrollTop,
        targetId: element.id
      })
    }
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
  return (
    <div
      // layoutScroll
      ref={wrapperRef}
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc( 100vh - 50px )',
        marginBottom: 50,
        overflowY: 'auto'
      }}
    >
      <div style={{ width: '900px', height: '100%' }}>
        {/* <MouseSelection onSelectionChange={() => {}} onSelectionEnd={() => {}} eventsElement={wrapperRef.current} /> */}
        <AnimatePresence>
          {dragHandle && !isDragging && (
            <motion.div
              key={dragHandle.top}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseDown={handleStartDragging}
              style={{
                cursor: 'grab',
                position: 'absolute',
                top: dragHandle.top,
                left: dragHandle.left,
                zIndex: 99
              }}
            >
              <div style={{ position: 'absolute', left: -20, top: 20, width: 18, height: 18 }}>
                <Icon size={18} name="park-drag" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <InnerEditor
          editor={editor}
          defaultValue={initial}
          onDividerDragEnd={handleDividerDragEnd}
          onDividerDragStart={handleDividerDragStart}
          onBlockMouseEnter={handleMouseEnter}
          isDragging={isDragging}
        />
      </div>
      <div style={{ position: 'fixed', inset: 0, zIndex: 999, pointerEvents: 'none' }} role="dragging-layer">
        <div style={{ pointerEvents: 'auto', position: 'relative', zIndex: 0 }}>
          {isDragging && <div style={{ position: 'absolute', top: 0, left: 0 }} ref={draggingLayerRef}></div>}
        </div>
      </div>
    </div>
  )
}

type InnerEditorProps = {
  editor: CustomEditor
  defaultValue: Descendant[]
  isDragging: boolean
  onBlockMouseEnter: (e: MouseEvent, element: CustomElement) => void
  onDividerDragStart: Noop
  onDividerDragEnd: (previousColumnWidthRatio: number, previousColumnPath: Path, nextColumnWidthRatio: number, nextColumnPath: Path) => void
}
const InnerEditor: FC<InnerEditorProps> = memo(
  ({ editor, defaultValue, onBlockMouseEnter, onDividerDragStart, onDividerDragEnd, isDragging }) => {
    useWhyDidYouUpdate('inner', { editor, defaultValue, onBlockMouseEnter, onDividerDragEnd, onDividerDragStart, isDragging })
    const renderElement = ({ children, element, attributes }) => {
      if (element.type === 'paragraph') {
        return (
          <Block
            data-type="block"
            data-spec-type="paragraph"
            blockId={element.id}
            key={element.id}
            id={String(element.id)}
            element={element}
            onMouseEnter={onBlockMouseEnter}
            isDragging={isDragging}
            attributes={attributes}
            type={element.type}
          >
            <div key={element.id}>{children}</div>
          </Block>
        )
      }
      if (element.type === 'columnList') {
        return (
          <Block
            data-type="block"
            key={element.id}
            blockId={element.id}
            data-spec-type="columnList"
            id={String(element.id)}
            type="columnList"
            attributes={attributes}
          >
            {children}
          </Block>
        )
      }
      if (element.type === 'column') {
        return (
          <>
            <Divider
              isDragging={isDragging}
              onDragStart={onDividerDragStart}
              onDragEnd={onDividerDragEnd}
              currentPath={ReactEditor.findPath(editor, element)}
            />
            <Block
              data-type="column"
              id={String(element.id)}
              key={element.id}
              blockId={element.id}
              ratio={element.ratio}
              data-spec-type="column"
              type="column"
              attributes={attributes}
            >
              {children}
            </Block>
          </>
        )
      }
    }
    return (
      <Slate editor={editor} onChange={e => console.log(e)} value={defaultValue}>
        <Editable renderElement={renderElement}></Editable>
      </Slate>
    )
  }
)
type BlockProps = {
  blockId: number
  type: string
  ratio?: number
  isDragging?: boolean
  onMouseEnter?: (e: MouseEvent, element: CustomElement) => void
  element: CustomElement
}
const Block: FC<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & BlockProps & RenderElementProps> = memo(
  ({ isDragging, blockId, children, ratio, type, attributes, element, onMouseEnter, ...rest }) => {
    const ref = useRef<HTMLDivElement>(null)
    const mergedRef = mergeRefs(ref, attributes.ref)
    const columnRef = useRef<HTMLDivElement>(null)
    const emitter = useEventEmitter()
    const handler = new EditorEventHandler()
    const [direction, setDirection] = useState<string>()
    const handleIndicatorChange = useMemoizedFn((data: IndicatorChangeEvent) => {
      const { direction, id } = data
      if (id === blockId) {
        setDirection(direction)
      } else {
        setDirection(undefined)
      }
    })
    handler.on('indicatorChange', handleIndicatorChange)
    const indicatorStyle: CSSProperties = {
      position: 'absolute',
      left: direction === 'left' ? -4 : direction === 'top' || direction === 'bottom' ? 0 : undefined,
      top: direction === 'top' ? -4 : direction === 'left' || direction === 'right' ? 0 : undefined,
      bottom: direction === 'bottom' ? -4 : direction === 'left' || direction === 'right' ? 0 : undefined,
      right: direction === 'right' ? -4 : direction === 'top' || direction === 'bottom' ? 0 : undefined,
      width: direction === 'right' || direction === 'left' ? 4 : undefined,
      height: direction === 'top' || direction === 'bottom' ? 4 : undefined,
      backgroundColor: '#554994',
      borderRadius: '3px'
    }
    useEffect(() => {
      emitter.addListener('editor', handler)
      return () => emitter.removeListener('editor', handler)
    }, [])
    useEffect(() => {
      if (columnRef.current) {
        columnRef.current.style.width = `calc(( 100% - ${
          46 * ((columnRef.current?.parentElement?.querySelectorAll("[data-type='column']").length || 2) - 1)
        }px) * ${ratio})`
      }
    }, [ratio])
    const handleMouseEnter = (e: MouseEvent) => {
      onMouseEnter?.(e, element)
    }
    useWhyDidYouUpdate('block', { isDragging, children, ratio, ...rest })
    const renderChildren = useMemoizedFn(() => (
      <motion.div
        // layoutDependency={isDragging}
        // layout={'position'}
        key={blockId}
        {...attributes}
        ref={mergedRef}
        onMouseEnter={handleMouseEnter}
        {...rest}
        className={classNames(
          type === 'columnList' && styles.ColumnListBlock,
          type === 'column' && styles.ColumnBlock,
          type === 'paragraph' && styles.ParagraphBlock
        )}
      >
        {children}
        <AnimatePresence>
          {direction && (
            <motion.div
              transition={{ duration: 0.15 }}
              key={direction}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div style={indicatorStyle} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    ))
    return type === 'column'
      ? cloneElement(
          <motion.div layout="position"></motion.div>,
          {
            ref: columnRef,
            style: {
              paddingTop: 12,
              paddingBottom: 12,
              flexGrow: 0,
              flexShrink: 0
            }
          },
          renderChildren()
        )
      : renderChildren()
  }
)

type DividerProps = {
  onDragStart: () => void
  onDragEnd: (previousColumnWidthRatio: number, previousColumnPath: Path, nextColumnWidthRatio: number, nextColumnPath: Path) => void
  currentPath: Path
  isDragging?: boolean
}
const Divider: FC<DividerProps> = ({ onDragEnd, onDragStart, currentPath, isDragging }) => {
  const dividerRef = useRef<HTMLDivElement>(null)
  const widthRef = useRef(null)
  const [isDraggingHandle, setIsDraggingHandle] = useState(false)
  const handleDragStart = (e: MouseEvent) => {
    setIsDraggingHandle(true)
    onDragStart?.()
    const divider = dividerRef.current
    if (divider) {
      const previousColumn = divider.previousElementSibling
      const nextColumn = divider.nextElementSibling
      widthRef.current = {
        previousColumnWidth: previousColumn?.getBoundingClientRect().width,
        nextColumnWidth: nextColumn?.getBoundingClientRect().width
      }
    }
  }
  const handleDrag = (e: MouseEvent, info: PanInfo) => {
    const { x: dx, y: dy } = info.offset
    const divider = dividerRef.current
    if (divider && widthRef.current) {
      if (widthRef.current.previousColumnWidth + dx < 50 || widthRef.current.nextColumnWidth - dx < 50) {
        console.log('return edasd ')
        return
      }
      const previousColumn = divider.previousElementSibling as HTMLElement
      previousColumn.style.width = `${widthRef.current.previousColumnWidth + dx}px`
      const nextColumn = divider.nextElementSibling as HTMLElement
      nextColumn.style.width = `${widthRef.current.nextColumnWidth - dx}px`
    }
  }
  const handleDragEnd = useMemoizedFn((e: MouseEvent) => {
    widthRef.current = undefined
    setIsDraggingHandle(false)
    const divider = dividerRef.current
    if (divider) {
      const previousColumn = divider.previousElementSibling as HTMLElement
      const previousColumnWidth = previousColumn.clientWidth
      const nextColumn = divider.nextElementSibling as HTMLElement
      const nextColumnWidth = nextColumn.clientWidth
      const allColumnsWidth = Array.from(divider.parentElement?.querySelectorAll("[data-type='column']") || []).reduce((prev, curr) => {
        return prev + curr.getBoundingClientRect().width
      }, 0)
      const previousColumnWidthRatio = previousColumnWidth / allColumnsWidth
      const nextColumnWidthRatio = nextColumnWidth / allColumnsWidth
      onDragEnd(previousColumnWidthRatio, Path.previous(currentPath), nextColumnWidthRatio, currentPath)
    }
  })
  return (
    <>
      {!isDragging || isDraggingHandle ? (
        <motion.div
          drag="x"
          onDragEnd={handleDragEnd}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          ref={dividerRef}
          style={{ opacity: isDraggingHandle ? 1 : undefined }}
          contentEditable={false}
          className={styles.DividerWrapper}
        >
          <motion.div className={styles.Divider}></motion.div>
        </motion.div>
      ) : (
        <div className={styles.DividerWrapper}></div>
      )}
    </>
  )
}
const withShortcuts = (editor: CustomEditor) => {
  const { deleteBackward, insertText, insertBreak, deleteForward, insertNode, insertFragment } = editor
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
  editor.insertFragment = nodes => {
    nodes.forEach(i => (i.id = Id.getId()))
    insertFragment(nodes)
  }
  editor.insertNode = node => {
    const { fontSize } = editor
    console.log('insert node')
    node.id = Id.getId()
    node.children[0].fontSize = fontSize
    let nextPath = null

    if (Positions.isStartSpacer(editor) || Positions.isEndSpacer(editor) || Positions.outermostBlock(editor)?.[0]?.type === 'hole') {
      const wrapper = Positions.outermostBlock(editor)
      if (Positions.isStartSpacer(editor)) {
        nextPath = wrapper[1]
      } else {
        nextPath = Path.next(wrapper[1])
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
    const { selection, marks, fontSize } = editor
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
          const [block, path] = currentPrevious
          if (block.type === 'hole') {
            Transforms.removeNodes(editor, { at: path })
            return
          }
        }
        if (!Editor.isEditor(block) && Element.isElement(block) && block.type === 'spacer') {
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
        if (!Editor.isEditor(block) && Element.isElement(block) && block.type !== 'paragraph' && Point.equals(selection.anchor, start)) {
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
    const { selection, fontSize } = editor
    if (selection && Range.isCollapsed(selection)) {
      if (Positions.isEndSpacer(editor)) {
        const wrapper = Positions.outermostBlock(editor)
        const nextPath = Path.next(wrapper?.[1])
        Transforms.insertNodes(
          editor,
          {
            type: 'paragraph',
            children: [{ text: '' }]
          },
          { at: nextPath }
        )
        Transforms.select(editor, nextPath)
        return
      }
      const match = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n)
      })
      if (match) {
        const [, path] = match
        const currentParent = Editor.parent(editor, path)
        if (currentParent) {
          editor.insertNode({
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
  return editor
}
