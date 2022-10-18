import { FC } from 'react'
import styles from './index.module.less'

interface HeadingProps {
  fontSize?: string | number
  children: React.ReactNode
}
const Heading: FC<HeadingProps> = ({ fontSize, children }) => {
  return (
    <div style={{ userSelect: 'none' }} className={styles.verticalCenterFlex}>
      <div className={styles.heading} style={{ fontSize: fontSize || '15px', fontWeight: 'bolder' }}>
        {children}
      </div>
    </div>
  )
}
export default Heading
