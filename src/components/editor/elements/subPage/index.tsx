import { Content } from '@/components/base'
import Icon from '@/components/base/Icon'
import useEventEmitter from '@/events/useEventEmitter'
import useNoteStore from '@/stores/note.store'
import { useEffect, useState } from 'react'
import { RenderElementProps } from 'slate-react'
import { INote } from '~/typings/data'
import { SubPageElement } from '../../types/outerElementTypes'
import styles from './index.module.less'

const SubPage = ({ children, attributes, element }: RenderElementProps) => {
  const ele = element as SubPageElement
  const { getNoteById } = useNoteStore()
  const [subPageNote, setSubPageNote] = useState<INote>()
  const emitter = useEventEmitter()
  useEffect(() => {
    getNoteById(ele.originId).then(note => setSubPageNote(note))
  }, [getNoteById])
  const handleLinkClick = () => {
    emitter.emit('editor',{
      type: 'insertTab',
      data: {
        isNew: false,
        noteId: ele.originId
      }
    })
  }
  return (
    <div contentEditable={false}>
      <Content onClick={handleLinkClick} flex gap={10} className={styles.subPageLinkWrapper}>
        <Icon name="park-doc-detail" />
        <span>{subPageNote?.title || 'Untitled'}</span>
        {children}
      </Content>
    </div>
  )
}

export default SubPage
