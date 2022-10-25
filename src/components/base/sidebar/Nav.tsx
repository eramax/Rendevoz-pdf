import Icon from '@/components/base/Icon'
import NewItemDialog from '@/components/dialogs/NewItemDialog'
import SearchDialog from '@/components/dialogs/SearchDialog/SearchDialog'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Modal from '../modal'
import styles from './index.module.less'
import { MenuItem } from './Item'
import { useTranslation } from 'react-i18next'
import SettingDialog from '@/components/dialogs/SettingDialog'

const variants = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 }
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 }
  }
}
const Navigation = () => {
  const [searchVisible, setSearchVisible] = useState(false)
  const [newItemVisible, setNewItemVisible] = useState(false)
  const [settingVisible, setSettingVisible] = useState(false)
  const { t } = useTranslation()
  return (
    <>
      <Modal visible={searchVisible} onClose={() => setSearchVisible(false)}>
        <SearchDialog onSearchComplete={() => setSearchVisible(false)} />
      </Modal>
      <Modal visible={newItemVisible} onClose={() => setNewItemVisible(false)}>
        <NewItemDialog />
      </Modal>
      <Modal width={300} height={300} visible={settingVisible} onClose={() => setSettingVisible(false)}>
        <SettingDialog />
      </Modal>
      <motion.ul className={styles.list} variants={variants}>
        <MenuItem to="/home">
          <Icon name="park-home" style={{ marginRight: 10 }} />
          {t('sidebar.home')}
        </MenuItem>
        <MenuItem to="/editor">
          <Icon name="park-editor" style={{ marginRight: 10 }} />
          {t('sidebar.editor')}
        </MenuItem>
        <MenuItem to="/collections">
          <Icon name="park-document-folder" style={{ marginRight: 10 }} />
          {t('sidebar.collections')}
        </MenuItem>
        <MenuItem onClick={() => setSearchVisible(true)}>
          <Icon name="park-search" style={{ marginRight: 10 }} />
          {t('sidebar.search')}
        </MenuItem>
        <MenuItem onClick={() => setNewItemVisible(true)}>
          <Icon name="park-plus" style={{ marginRight: 10 }} />
          {t('sidebar.new')}
        </MenuItem>
        <MenuItem onClick={() => setSettingVisible(true)}>
          <Icon name="park-setting-two" style={{ marginRight: 10 }} />
          {t('sidebar.setting')}
        </MenuItem>
      </motion.ul>
    </>
  )
}

export default Navigation
