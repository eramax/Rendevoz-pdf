import NavLinkWithChildren from '@/components/base/navLink'
import classNames from 'classnames'
import { FC, MouseEvent, MouseEventHandler, useState } from 'react'
import styles from './index.module.less'

interface MenuItemProps {
  onClick?: MouseEventHandler
  onDoubleClick?: MouseEventHandler
  icon?: React.ReactNode
  to?: string
  type: 'route' | 'button' | 'link' | 'separator'
  children: React.ReactNode
  selected?: boolean
  id?: number | string
}
const MenuItem: FC<MenuItemProps> = ({ type, icon, to, onClick, onDoubleClick, children, selected, id }) => {
  return (
    <>
      {type === 'route' && to && (
        <NavLinkWithChildren to={to}>
          {match => <Item id={id} children={children} icon={icon} onDoubleClick={onDoubleClick} />}
        </NavLinkWithChildren>
      )}
      {type === 'button' && (
        <Item id={id} selected={selected} children={children} icon={icon} onClick={onClick} onDoubleClick={onDoubleClick} />
      )}
    </>
  )
}

const Item: FC<Omit<MenuItemProps, 'type'>> = ({ icon, children, onClick, onDoubleClick, selected, id }) => {
  const className = classNames(styles.item, selected && styles.selected)

  const handleInternalClick = (e: MouseEvent) => {
    onClick?.(e)
  }
  return (
    <div
      id={String(id)}
      className={className}
      onMouseDown={e => e.preventDefault()}
      onDoubleClick={onDoubleClick}
      onClick={handleInternalClick}
      style={{ position: 'relative' }}
    >
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.text}>{children}</div>
    </div>
  )
}

export default MenuItem
