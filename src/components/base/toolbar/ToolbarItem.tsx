import Icon from '@/components/base/Icon'
import { useTheme } from '@/hooks'
import classNames from 'classnames'
import { cloneElement, createElement, CSSProperties, FC, MouseEventHandler, ReactNode } from 'react'
import Tooltip from '../Tooltip'
import styles from './index.module.less'

interface ToolbarItemProps {
  onClick?: MouseEventHandler
  className?: string
  title?: string
  size?: number
  iconClassName?: string
  children?: ReactNode
  style?: CSSProperties
  iconName?: string
  space?: number
  isActive?: boolean
  disabled?: boolean
  clickPreventDefault?: boolean
  tooltip?: string
}

const ToolbarItem: FC<ToolbarItemProps> = ({
  onClick,
  className,
  iconClassName,
  size = 18,
  children,
  style,
  title,
  iconName,
  space,
  clickPreventDefault = false,
  isActive = false,
  direction,
  tooltip,
  disabled
}) => {
  const { primaryColor } = useTheme('primaryColor')

  const renderItem = () => {
    if (iconName) {
      return <Icon cursor={disabled ? 'inherit' : 'pointer'} className={iconClassName} size={size} name={iconName} />
    }
    if (title) {
      return <div className={styles.title}>{title}</div>
    }
    return children
  }
  const handleClick = (e: MouseEvent) => {
    if (clickPreventDefault) {
      e.preventDefault()
    }
    e.preventDefault()
    onClick?.(e)
  }
  return cloneElement(
    createElement('div'),
    {
      key: iconName,
      'data-active': isActive,
      'data-disabled': disabled,
      className: classNames(className, styles.icon),
      style: {
        ...style,
        color: primaryColor,
        marginLeft: direction === 'horizontal' ? space : undefined,
        marginBottom: direction === 'vertical' ? space : undefined,
        cursor: disabled ? 'not-allowed' : style?.cursor
      },
      onMouseDown: clickPreventDefault ? e => e.preventDefault() : undefined,
      onClick: handleClick
    },
    <Tooltip content={tooltip}>{renderItem()}</Tooltip>
  )
}
export default ToolbarItem
