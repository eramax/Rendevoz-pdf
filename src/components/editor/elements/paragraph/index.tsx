import { EditorEventHandler } from '@/events/editorEvent'
import useEventEmitter from '@/events/useEventEmitter'
import { FC, useEffect, useState } from 'react'
import { Range } from 'slate'
import { RenderElementProps, useSelected, useSlate } from 'slate-react'
import styles from './index.module.less'

const Paragraph: FC<RenderElementProps> = ({ children, element }) => {
  const [hidePlaceHolder, setHidePlaceHolder] = useState(false)
  const handler = new EditorEventHandler()
  const emitter = useEventEmitter()
  const selected = useSelected()
  const selection = useSlate().selection
  let isCollapsed = true
  if (selection !== null) {
    isCollapsed = Range.isCollapsed(selection)
  }
  handler.on('compositionStart', () => setHidePlaceHolder(true))
  handler.on('compositionEnd', () => setHidePlaceHolder(false))
  useEffect(() => {
    emitter.addListener('editor', handler)
    return () => {
      emitter.removeListener('editor', handler)
    }
  }, [])
  const isEmpty = element.children[0].text === '' && element.children.length === 1
  useEffect(() => {
    if (element.children[0].text === '/') {
      emitter.emit('editor', {
        type: 'openMenu'
      })
    }
  }, [element])
  return (
    <div
      style={{ fontSize: element.children[0].text === '' ? element.children[0].fontSize : undefined }}
      className={selected && isCollapsed && isEmpty && !hidePlaceHolder ? styles.selectedEmpty : undefined}
    >
      {children}
    </div>
  )
}
export default Paragraph
