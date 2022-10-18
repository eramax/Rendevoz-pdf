import { useToggle } from '@/hooks'
import useNoteStore from '@/stores/note.store'
import { FC, MouseEventHandler, useEffect, useState } from 'react'
import { INote } from '~/typings/data'
import { Content } from '../base'
import Menu from '../base/menu'
import Icon from '../base/Icon'
import styles from './index.module.less'
import { AnimatePresence, motion } from 'framer-motion'

interface NoteItemProps {
  note: INote
  onClick?: (note: INote) => void
}

const NoteItem: FC<NoteItemProps> = ({ note, onClick }) => {
  const { findSubNotes, all } = useNoteStore()
  const [subNotes, setSubNotes] = useState<INote[]>([])
  const [collapsed, toggleCollapsed] = useToggle(true)
  useEffect(() => {
    findSubNotes(note.id).then(data => {
      setSubNotes(data)
    })
  }, [findSubNotes])
  const handleClick = e => {
    if (subNotes.length > 0) {
      toggleCollapsed()
    }
    onClick?.(note)
  }
  return (
    <>
      <Menu.Item id={note?.id} onClick={handleClick} icon={<Icon name="park-notes" />} type="button">
        {subNotes?.length > 0 && (
          <div
            style={{ transform: !collapsed ? 'rotate(90deg) translateY(-50%)' : 'translateY(-50%)' }}
            className={styles.collectionItemArrow}
          >
            <Icon name="park-right" />
          </div>
        )}
        {note?.title || 'Untitled'}
      </Menu.Item>
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Content style={{ paddingLeft: '10px' }}>
              {subNotes?.map(i => (
                <NoteItem note={i} onClick={onClick} />
              ))}
            </Content>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
export default NoteItem
