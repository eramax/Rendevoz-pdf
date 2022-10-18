import classNames from 'classnames'
import { FC } from 'react'
import styles from './index.module.less'

interface ContainerProps {
  className?: string
  column?: boolean
  auto?: boolean
  levelCenter?: boolean
  verticalCenter?: boolean
  children: React.ReactNode
  style?: React.CSSProperties
}

const Container: FC<ContainerProps> = ({ column, auto, children, levelCenter, verticalCenter, style,className }) => {
  return (
    <div
      className={classNames(styles.container, className)}
      style={{
        ...style,
        flexDirection: column ? 'column' : 'row',
        flex: auto ? '1 1 auto' : 'initial',
        justifyContent: levelCenter ? 'center' : 'initial',
        alignItems: verticalCenter ? 'center' : 'initial'
      }}
    >
      {children}
    </div>
  )
}
export default Container
