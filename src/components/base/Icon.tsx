import React, { CSSProperties, forwardRef } from 'react'
import { Property } from 'csstype'
import { default as IconPark } from '@icon-park/react/es/all'
import { Content } from '.'
import CustomIcon from '../custom/icons/CustomIcon'

export interface IconProps {
  name: string
  theme?: 'outline' | 'filled' | 'two-tone' | 'multi-color'
  size?: number
  cursor?: Property.Cursor
  className?: string
  containerStyle?: CSSProperties
  containerClassName?: string
  fill?: string | string[]
  color?: string
}
const Icon = forwardRef<HTMLDivElement, IconProps>(
  ({ name, size, fill, theme, className, cursor, color, onClick, containerClassName, containerStyle, ...rest }, ref) => {
    const style: React.CSSProperties = {
      cursor: cursor,
      userSelect: 'none',
      ...rest.style
    }
    const renderIcon = (name: string) => {
      if (name.startsWith('park')) {
        return (
          <IconPark
            color={color}
            fill={fill}
            {...rest}
            style={style}
            className={className}
            type={name.slice(5)}
            theme={theme}
            size={size}
          />
        )
      }
      if (name.startsWith('custom')) {
        return <CustomIcon {...rest} style={style} className={className} type={name.slice(7)} theme={theme} size={size} />
      }
    }
    return (
      <Content style={containerStyle} className={containerClassName} onClick={onClick} flex centered ref={ref}>
        {renderIcon(name)}
      </Content>
    )
  }
)
export default Icon
