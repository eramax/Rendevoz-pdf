import { Noop } from '@/common/types'
import { ColorPicker, Icon } from '@/components'
import { Content, Toolbar, WithBorder } from '@/components/base'
import Select from '@/components/base/select'
import Menu from '@/components/base/menu'
import IconWithPopover from '@/components/base/IconWithPopover'
import { CSSProperties, FC, useRef } from 'react'
import { Editor } from 'slate'
import { useSlate } from 'slate-react'
import styles from './index.module.less'
import { useTranslation } from 'react-i18next'

interface EditorToolbarProps {
  fontSize?: number
  alignment?: string
  onRedo: Noop
  onUndo: Noop
  onBold: Noop
  onItalic: Noop
  onSave: Noop
  onUnderline: Noop
  onChangeFontSize: (fontSize: string) => void
  onChangeFontColor: (color: string) => void
  onToggleOutline: Noop
  onToggleMindmap: Noop
  onToggleEmoji: Noop
  onAddSubPage?: Noop
  style?: CSSProperties
}
const EditorToolbar: FC<EditorToolbarProps> = ({
  onRedo,
  onSave,
  onUndo,
  onBold,
  onItalic,
  onUnderline,
  onChangeFontSize,
  onChangeFontColor,
  onToggleOutline,
  onToggleMindmap,
  onToggleEmoji,
  onAddSubPage,
  style
}) => {
  const { t } = useTranslation()
  const editor = useSlate()
  const { selection } = editor
  const currentElement = selection ? Editor.node(editor, selection?.anchor?.path, { depth: 1 }) : null
  // console.log(currentElement)
  const morePopoverRef = useRef()
  const isMarkActive = format => {
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : false
  }
  const getFontSize = () => {
    const marks = Editor.marks(editor)
    return marks ? (marks['fontSize'] ? marks['fontSize'] : '16px') : '16px'
  }
  const getFontColor = () => {
    const marks = Editor.marks(editor)
    return marks ? marks['fontColor'] : undefined
  }
  return (
    <>
      <Toolbar className={styles.toolbar} style={style} itemClickPreventDefault itemSize={16}>
        {/* <Toolbar.Item iconName="park-mindmap-list" onClick={onToggleOutline} />
        <Toolbar.Item iconName="park-mindmap-map" onClick={onToggleMindmap} /> */}
        <Toolbar.Item tooltip={t('editor.save')} iconName="park-save" onClick={onSave} />
        <Toolbar.Item tooltip={t('editor.undo')} iconName="park-return" onClick={onUndo} />
        <Toolbar.Item tooltip={t('editor.redo')} iconName="park-go-on" onClick={onRedo} />
        <Select
          closeOnSelect
          disabled={
            currentElement &&
            ['heading-one', 'heading-two', 'heading-three', 'heading-four', 'heading-five', 'heading-six'].includes(currentElement[0].type)
          }
          value={getFontSize()}
          defaultValue="14px"
          style={{ maxWidth: '50px', margin: '0px 0px 0px 10px' }}
          onSelect={value => {
            onChangeFontSize(value[0])
          }}
        >
          <Select.Option value="14px">14px</Select.Option>
          <Select.Option value="16px">16px</Select.Option>
          <Select.Option value="20px">20px</Select.Option>
          <Select.Option value="24px">24px</Select.Option>
          <Select.Option value="28px">28px</Select.Option>
          <Select.Option value="32px">32px</Select.Option>
          <Select.Option value="36px">36px</Select.Option>
          <Select.Option value="40px">40px</Select.Option>
          <Select.Option value="50px">50px</Select.Option>
          <Select.Option value="60px">60px</Select.Option>
        </Select>
        <Toolbar.Item>
          <IconWithPopover
            tooltip={t('editor.font color')}
            placement={['bottom']}
            size={16}
            name="park-font-size-two"
            color={getFontColor()}
            content={
              <WithBorder>
                <ColorPicker onPick={onChangeFontColor} />
              </WithBorder>
            }
          ></IconWithPopover>
        </Toolbar.Item>
        <Toolbar.Item tooltip={t('editor.bold')} isActive={isMarkActive('bold')} iconName="park-text-bold" onClick={onBold} />
        <Toolbar.Item tooltip={t('editor.italic')} isActive={isMarkActive('italic')} iconName="park-text-italic" onClick={onItalic} />
        <Toolbar.Item
          tooltip={t('editor.underline')}
          isActive={isMarkActive('underline')}
          iconName="park-text-underline"
          onClick={onUnderline}
        />
        <Toolbar.Item>
          <IconWithPopover
            innerRef={morePopoverRef}
            disableIntersection
            tooltip={t('editor.more')}
            name="park-more"
            placement={['bottom']}
            content={
              <WithBorder style={{ padding: '8px 0px' }}>
                <Menu>
                  <Menu.Group title={t('editor.inline elements')}>
                    <Menu.Item
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        onToggleEmoji?.()
                        morePopoverRef.current?.close()
                      }}
                    >
                      <IconWithDescription
                        title="Emoji"
                        description={t('editor.use emoji to express your ideas')}
                        icon="park-message-emoji"
                      ></IconWithDescription>
                    </Menu.Item>
                    {/* <Menu.Item type="button">
                      <IconWithDescription title="Link" description="Link to external pages" icon="park-link-one"></IconWithDescription>
                    </Menu.Item> */}
                  </Menu.Group>
                  <Menu.Group title={t('editor.block elements')}>
                    <Menu.Item
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        onAddSubPage?.()
                        morePopoverRef.current?.close()
                      }}
                    >
                      <IconWithDescription
                        title={t('editor.sub page')}
                        description={t('editor.add sub page')}
                        icon="park-doc-detail"
                      ></IconWithDescription>
                    </Menu.Item>
                    {/* <Menu.Item
                      type="button"
                      onClick={e => {
                        e.stopPropagation()

                        morePopoverRef.current?.close()
                      }}
                    >
                      <IconWithDescription
                        title={t('editor.keyword')}
                        description={t('editor.use keyword to organize your ideas')}
                        icon="park-key"
                      ></IconWithDescription>
                    </Menu.Item> */}
                  </Menu.Group>
                </Menu>
              </WithBorder>
            }
          ></IconWithPopover>
        </Toolbar.Item>
        {/* <Toolbar.Item iconName="park-ordered-list"></Toolbar.Item>
      <Toolbar.Item iconName="park-unordered-list"></Toolbar.Item> */}
      </Toolbar>
    </>
  )
}

const IconWithDescription: FC<{
  icon: string
  title: string
  description?: string
}> = ({ icon, title, description }) => {
  return (
    <Content flex alignItems="center" fullWidth>
      <Content style={{ width: 40, height: 40, borderRadius: 7, marginRight: 10 }} flex centered>
        <Icon size={30} name={icon} />
      </Content>
      <Content auto flex column alignItems="center">
        <Content fullWidth style={{ fontSize: 16, fontWeight: 500 }}>
          {title}
        </Content>
        {description && (
          <Content fullWidth style={{ fontSize: 12 }}>
            {description}
          </Content>
        )}
      </Content>
    </Content>
  )
}
export default EditorToolbar
