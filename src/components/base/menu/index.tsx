import { CSSProperties, FC, MouseEventHandler, ReactNode } from 'react'
import Content from '../Content'
import styles from './index.module.less'
import MenuGroup from './MenuGroup'
import MenuItem from './MenuItem'

interface MenuProps {
  title?: string
  extra?: ReactNode
  footer?: ReactNode
  children: ReactNode
  style?: CSSProperties
  onClick?: MouseEventHandler
}
interface IMenu extends FC<MenuProps> {
  Item: typeof MenuItem
  Group: typeof MenuGroup
}
const Menu: IMenu = ({ title, children, extra, footer, style,onClick }) => {
  return (
    <div className={styles.menu} style={style} onClick={onClick}>
      <Content style={{ marginBottom: 8 }} flex alignItems="center" justifyContent="space-between">
        {title && <div className={styles.title}>{title}</div>}
        {extra}
      </Content>
      <Content position="relative" fullHeight fullWidth style={{flexGrow: 1}}>{children}</Content>
      {footer && <Content fullWidth>{footer}</Content>}
    </div>
  )
}
Menu.Item = MenuItem
Menu.Group = MenuGroup
export default Menu
