import { Noop } from '@/common/types'
import { ColorPicker, IconPicker, Toolbar, WithBorder } from '@/components'
import { PrettyInput } from '@/components/custom/input/pretty'
import useWhyDidYouUpdate from '@/hooks/utils/useWhyUpdate'
import { FC, memo, useEffect } from 'react'
import IconWithPopover from '../../../base/IconWithPopover'
import { TextSelectionSearch, TextSelectionTranslate } from './TextSelectionToolbar'

type Layout =
  | 'colorPicker'
  | 'iconPicker'
  | 'contentInput'
  | 'separator'
  | 'addToEditorButton'
  | 'movableToggle'
  | 'translator'
  | 'searcher'
  | 'delete'
  | 'direction'

type LabelToolbarProps = {
  color?: string
  movable?: boolean
  content?: string
  selectedText?: string
  onMovableChange?: Noop
  onIconChange?: (icon: string) => void
  onColorChange?: (color: string) => void
  onAddToEditor?: Noop
  onDelete?: Noop
  onContentChange?: (value: string) => void
  onDirectionChange?: Noop
  layout?: Layout[]
}

const Icons = [
  'park-info',
  'park-bookmark',
  'park-dislike',
  'park-like',
  'park-caution',
  'park-link',
  'park-picture',
  'park-view-list',
  'park-quote',
  'park-help'
]
const LabelToolbar: FC<LabelToolbarProps> = ({
  onColorChange,
  onIconChange,
  onMovableChange,
  onAddToEditor,
  onContentChange,
  onDelete,
  onDirectionChange,
  selectedText,
  content,
  color,
  movable = false,
  layout = ['colorPicker', 'iconPicker', 'contentInput', 'separator', 'addToEditorButton', 'movableToggle', 'direction', 'delete']
}) => {
  const ColorPickerItem = (
    <Toolbar.Item key="colorPicker">
      <IconWithPopover
        disableNudge
        name="park-platte"
        color={color}
        content={
          <WithBorder>
            <ColorPicker onPick={onColorChange} />
          </WithBorder>
        }
      ></IconWithPopover>
    </Toolbar.Item>
  )

  const IconPickerItem = (
    <Toolbar.Item key="iconPicker">
      <IconWithPopover
        name="park-graphic-design"
        content={
          <WithBorder>
            <IconPicker onIconPick={icon => onIconChange?.(icon)} icons={Icons} />
          </WithBorder>
        }
      />
    </Toolbar.Item>
  )

  const ContentInputItem = (
    <Toolbar.Item key="contentInput">
      <IconWithPopover
        defaultOpen={content === '' || content?.length === 0}
        name="park-text"
        disableNudge
        content={
          <WithBorder style={{ padding: '6px' }}>
            <PrettyInput
              defaultFocused
              defaultValue={content}
              textarea
              displayText="Input your thought"
              onChange={e => {
                onContentChange?.(e.target.value)
              }}
            />
          </WithBorder>
        }
      />
    </Toolbar.Item>
  )
  const DirectionItem = <Toolbar.Item key="direction" iconName="park-direction" onClick={onDirectionChange}></Toolbar.Item>
  const AddToEditorButtonItem = <Toolbar.Item key="addToEditor" iconName="park-doc-add" onClick={onAddToEditor} />

  const MovableToggleItem = (
    <Toolbar.Item
      key="move"
      onClick={e => {
        onMovableChange?.()
        e.stopPropagation()
      }}
      iconName={!movable ? 'park-move' : 'custom-move-block'}
    />
  )

  const Separator = <Toolbar.Separator key="separator" />

  const TranslatorItem = (
    <Toolbar.Item key="translate">
      <IconWithPopover
        name="park-translate"
        content={
          <WithBorder style={{ padding: 20 }}>
            <TextSelectionTranslate translateInput={selectedText} />
          </WithBorder>
        }
      />
    </Toolbar.Item>
  )

  const SearcherItem = (
    <Toolbar.Item key="search">
      <IconWithPopover
        name="park-search"
        content={
          <WithBorder style={{ padding: 20 }}>
            <TextSelectionSearch searchInput={selectedText} />
          </WithBorder>
        }
      />
    </Toolbar.Item>
  )
  const DeleteItem = <Toolbar.Item key="delete" iconName="park-delete" onClick={onDelete}></Toolbar.Item>
  const toolbarRenderer = () => {
    return layout.map(i => {
      switch (i) {
        case 'colorPicker':
          return ColorPickerItem
        case 'contentInput':
          return ContentInputItem
        case 'addToEditorButton':
          return AddToEditorButtonItem
        case 'iconPicker':
          return IconPickerItem
        case 'movableToggle':
          return MovableToggleItem
        case 'separator':
          return Separator
        case 'translator':
          return TranslatorItem
        case 'searcher':
          return SearcherItem
        case 'delete':
          return DeleteItem
        case 'direction':
          return DirectionItem
      }
    })
  }
  return <Toolbar>{toolbarRenderer()}</Toolbar>
}

export default memo(LabelToolbar)
