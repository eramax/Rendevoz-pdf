import { Noop } from '@/common/types'
import useEventEmitter from '@/events/useEventEmitter'
import { useMemoizedFn } from '@/hooks'
import { Position } from '@/types'
import Id from '@/utils/id'
import isHotkey from 'is-hotkey'
import { FC, FormEventHandler, memo, useCallback, useRef } from 'react'
import { Descendant, Editor, Path, Range, Transforms, Element as SlateElement, Node } from 'slate'
import { ReactEditor, Slate, Editable, RenderElementProps, RenderLeafProps } from 'slate-react'
import { Content } from '../base'
import EditorToolbar from './components/toolbar'
import HOTKEYS from './consts/hotkeys'
import { CustomEditor, CustomElement } from './customTypes'
import Divider from './Divider'
import Block from './elements/block'
import Emoji from './elements/Emoji'
import { Heading } from './elements/heading'
import Highlight from './elements/highlight'
import Paragraph from './elements/paragraph'
import { Spacer } from './elements/Spacer'
import SubPage from './elements/subPage'
import Thought from './elements/thought'
import styles from './index.module.less'
import { getCaretGlobalPosition } from './utils/positions/caret'

type InnerEditorProps = {
  editor: CustomEditor
  defaultValue: Descendant[]
  onChange?: (value: Descendant[]) => void
  onTitleChange?: FormEventHandler<HTMLDivElement>
  onToggleMindmap: Noop
  onToggleOutline: Noop
  onBlockMouseEnter: (e: MouseEvent, element: CustomElement) => void
  onDividerDragStart: Noop
  onDividerDragEnd: (previousColumnWidthRatio: number, previousColumnPath: Path, nextColumnWidthRatio: number, nextColumnPath: Path) => void
  onSave?: (value: any[]) => void
  onAddSubPage?: () => void
}
const InnerEditor: FC<InnerEditorProps> = memo(
  ({
    editor,
    defaultValue,
    title,
    onBlockMouseEnter,
    onDividerDragStart,
    onDividerDragEnd,
    onToggleMindmap,
    onToggleOutline,
    onChange,
    onTitleChange,
    onSave,
    onAddSubPage
  }) => {
    const emitter = useEventEmitter()
    const renderInnerElement = useCallback((props: RenderElementProps) => <Element {...props} />, [])
    const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, [])
    const caretPositionRef = useRef<Position>()
    const handleMouseDown = useMemoizedFn(() => {
      if (getCaretGlobalPosition()) {
        caretPositionRef.current = getCaretGlobalPosition()
      }
    })
    const handleChange = useMemoizedFn((value: Descendant[]) => {
      onChange?.(value)
      if (getCaretGlobalPosition()) {
        caretPositionRef.current = getCaretGlobalPosition()
      }
    })
    const renderElement = useCallback(({ children, element, attributes }: RenderElementProps) => {
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
            <Divider onDragStart={onDividerDragStart} onDragEnd={onDividerDragEnd} currentPath={ReactEditor.findPath(editor, element)} />
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
      if (element.type !== 'spacer' && element.type !== 'highlight' && element.type !== 'emoji') {
        return (
          <Block
            data-type="block"
            blockId={element.id}
            key={element.id}
            id={String(element.id)}
            element={element}
            onMouseEnter={onBlockMouseEnter}
            attributes={attributes}
            type={element.type}
          >
            {renderInnerElement({ children, element, attributes })}
          </Block>
        )
      } else {
        return renderInnerElement({ children, element, attributes })
      }
    }, [])
    const handleKeydown = useMemoizedFn((e: KeyboardEvent) => {
      const { selection } = editor
      if (selection && Range.isCollapsed(selection)) {
        if (isHotkey('left', e)) {
          e.preventDefault()
          const path = selection.anchor.path
          console.log()
          let distance = 1
          if (
            Path.hasPrevious(path) &&
            Editor.node(editor, Path.previous(path))[0].type === 'emoji' &&
            Editor.isEdge(editor, selection.anchor, selection.anchor.path)
          )
            distance = 2
          Transforms.move(editor, { unit: 'offset', reverse: true, distance })
          return
        }
        if (isHotkey('right', e)) {
          e.preventDefault()
          const path = selection.anchor.path
          let distance = 1
          if (
            Editor.hasPath(editor, Path.next(path)) &&
            Editor.node(editor, Path.next(path))[0]?.type === 'emoji' &&
            Editor.isEdge(editor, selection.anchor, selection.anchor.path)
          )
            distance = 2
          Transforms.move(editor, { unit: 'offset', distance })
          return
        }
      }
      if (isHotkey('tab', e)) {
        e.preventDefault()
        Transforms.insertText(editor, '\u2003')
      }
      for (const hotkey in HOTKEYS) {
        if (isHotkey(hotkey, e)) {
          e.preventDefault()
          const mark = HOTKEYS[hotkey]
          toggleMark(editor, mark)
        }
      }
    })
    return (
      <Slate editor={editor} onChange={handleChange} value={defaultValue}>
        <EditorToolbar
          onSave={onSave}
          onToggleMindmap={onToggleMindmap}
          onToggleOutline={onToggleOutline}
          onChangeFontSize={fontSize => changeFontSize(editor, fontSize)}
          onChangeFontColor={color => Editor.addMark(editor, 'fontColor', color)}
          onRedo={() => editor.redo()}
          onUndo={() => editor.undo()}
          onBold={() => {
            toggleMark(editor, 'bold')
          }}
          onItalic={() => toggleMark(editor, 'italic')}
          onUnderline={() => toggleMark(editor, 'underline')}
          onToggleEmoji={() => {
            emitter.emit('editor', {
              type: 'toggleOverlay',
              data: {
                ...caretPositionRef.current,
                content: 'emojiPicker'
              }
            })
          }}
          onAddSubPage={onAddSubPage}
        />
        <Content flex centered style={{ width: '100%', marginBottom: 10 }}>
          <div
            onInput={onTitleChange}
            spellCheck="false"
            className={styles.title}
            placeholder="Untitled"
            contentEditable={true}
            style={{
              maxWidth: '100%',
              width: '100%'
            }}
          >
            {title}
          </div>
        </Content>
        <Editable
          autoFocus
          spellCheck="false"
          onFocus={e => {
            if (getCaretGlobalPosition()) {
              caretPositionRef.current = getCaretGlobalPosition()
            }
          }}
          onCompositionStart={() => emitter.emit('editor', { type: 'compositionStart' })}
          onCompositionEnd={() => emitter.emit('editor', { type: 'compositionEnd' })}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={handleKeydown}
          onMouseDown={handleMouseDown}
        ></Editable>
      </Slate>
    )
  }
)
const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)
  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const changeFontSize = (editor, fontSize: number) => {
  editor.fontSize = fontSize
  const { selection } = editor
  Editor.addMark(editor, 'fontSize', fontSize)
  Array.from(Editor.nodes(editor, { at: selection, mode: 'lowest' }))
    .filter(i => i[0].type === 'emoji')
    .map(i => i[1])
    .forEach(i => {
      Transforms.setNodes(
        editor,
        {
          fontSize: fontSize
        },
        {
          at: i
        }
      )
    })
}

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}
const Element = (props: RenderElementProps) => {
  const { element, attributes, children } = props
  if (!element.hide) {
    switch (element.type) {
      case 'paragraph':
        return <Paragraph {...props} />
      case 'block-quote':
        return <blockquote {...attributes}>{children}</blockquote>
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>
      case 'heading-one':
        return <Heading level={0} {...props} />
      case 'heading-two':
        return <Heading level={1} {...props} />
      case 'heading-three':
        return <Heading level={2} {...props} />
      case 'heading-four':
        return <Heading level={3} {...props} />
      case 'heading-five':
        return <Heading level={4} {...props} />
      case 'heading-six':
        return <Heading level={5} {...props} />
      case 'list-item':
        return <li {...attributes}>{children}</li>
      case 'highlight':
        return <Highlight {...props} />
      case 'spacer':
        return <Spacer {...props} />
      case 'hole':
        return <div className={styles.hole}>{children}</div>
      case 'thought':
        return <Thought {...props}>{children}</Thought>
      case 'emoji':
        return <Emoji {...props} />
      case 'subPage':
        return <SubPage {...props} />
      default:
        return <Paragraph {...props} />
    }
  }
}

const Leaf = (props: RenderLeafProps) => {
  let { leaf, attributes, children } = props
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  return (
    <span className={styles.leaf} style={{ fontSize: leaf.fontSize || '1em', color: leaf?.fontColor }} {...attributes}>
      {children}
    </span>
  )
}

export default InnerEditor
