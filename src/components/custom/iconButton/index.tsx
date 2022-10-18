import React, { useState } from 'react'
import Icon from '../../base/Icon'
import styles from './index.module.less'

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  name: string
  iconClassName?: string
}

export const IconButton: React.FC<Props> = props => {
  const [ripple, setRipple] = useState(false)
  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ripple) {
      setRipple(true)
      props.onClick?.(e)
      setTimeout(() => setRipple(false), 800)
    }
  }
  return (
    <div
      {...props}
      onClick={handleClick}
      style={props.style}
      tabIndex={0}
      className={ripple ? `${styles.defaultClickableIcon} ${styles.active}` : styles.defaultClickableIcon}
    >
      <Icon name={props.name} className={props.iconClassName}></Icon>
    </div>
  )
}
