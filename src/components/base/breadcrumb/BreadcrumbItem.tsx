import { FC } from 'react'
import NavLinkWithChildren from '../navLink'
import styles from './index.module.less'
import classnames from 'classnames'
import Content from '../Content'
interface CommonItem {
  style?: React.CSSProperties
  className?: string
  separator?: React.ReactNode
}
interface ButtonItem {
  type: 'button'
  to?: never
  children: React.ReactNode
  onClick: () => void
}
interface RouteItem {
  type: 'route'
  onClick?: never
  to: string
  children: (match: boolean) => React.ReactNode
}

export type BreadcrumbItemProps = CommonItem & (ButtonItem | RouteItem)

const BreadcrumbItem: FC<BreadcrumbItemProps> = ({ type, to, onClick, children, separator = '/', style, className }) => {
  const clazzName = classnames(className, styles.item)
  let item = null
  switch (type) {
    case 'button':
      item = (
        <span className={clazzName} style={style} onClick={onClick}>
          {children}
        </span>
      )
      break
    case 'route':
      item = <NavLinkWithChildren to={to}>{match => <>{children(match)}</>}</NavLinkWithChildren>
      break
    default:
      break
  }

  return (
    <Content flex alignItems="center">
      {item}
      {separator && <span className={styles.separator}>{separator}</span>}
    </Content>
  )
}

export default BreadcrumbItem
