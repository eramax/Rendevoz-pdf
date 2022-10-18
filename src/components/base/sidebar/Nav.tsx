import Icon from '@/components/base/Icon'
import { motion } from 'framer-motion'
import styles from './index.module.less'
import { MenuItem } from './Item'

const variants = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 }
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 }
  }
}
const Navigation = () => {
  return (
    <motion.ul className={styles.list} variants={variants}>
      <MenuItem to="/home">
        <Icon name="park-home" style={{ marginRight: 10 }} />
        Home
      </MenuItem>
      <MenuItem to="/editor">
        <Icon name="park-editor" style={{ marginRight: 10 }} />
        Editor
      </MenuItem>
      <MenuItem to="/collections">
        <Icon name="park-document-folder" style={{ marginRight: 10 }} />
        Collections
      </MenuItem>
    </motion.ul>
  )
}

export default Navigation
