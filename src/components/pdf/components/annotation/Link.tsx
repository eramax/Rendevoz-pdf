import { Content } from '@/components/base'
import { MouseEventHandler } from 'react'
import styles from './index.module.less'

const Link = ({ onClick }: { onClick: MouseEventHandler }) => {
  return <Content onClick={onClick} fullWidth fullHeight className={styles.link}></Content>
}

export default Link
