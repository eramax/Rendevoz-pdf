import Icon from '@/components/base/Icon'
import { CSSProperties, FC, ReactNode } from 'react'
import Content from '../Content'

interface TimelineItemProps {
  className?: string
  style?: CSSProperties
  iconName?: string
  iconSize?: number
  iconColor?: string
  children?: ReactNode
  hideTail?: boolean
  iconFill?: string | string[]
  iconTheme?: string
}

const TimelineItem: FC<TimelineItemProps> = ({
  className,
  iconTheme,
  hideTail,
  style,
  iconName = 'park-dot',
  iconSize = 10,
  iconColor,
  iconFill,
  children
}) => {
  const fontSize = style?.fontSize || 14
  return (
    <Content
      className={className}
      style={{
        position: 'relative',
        margin: 0,
        paddingBottom: iconSize * 2,
        ...style
      }}
    >
      <div style={{ position: 'absolute', width: iconSize, height: iconSize }}>
        <Icon theme={iconTheme} fill={iconFill || iconColor} name={iconName} size={iconSize} />
      </div>
      {!hideTail && (
        <div
          style={{
            position: 'absolute',
            top: iconSize,
            left: iconSize / 2 - 1,
            height: `calc(100% - ${iconSize}px)`,
            borderLeft: '2px solid rgba(0,0,0,0.06)'
          }}
        ></div>
      )}
      <div
        style={{
          position: 'relative',
          top: iconSize / 2 - fontSize / 2,
          marginLeft: iconSize + 10,
          wordBreak: 'break-word',
          lineHeight: 1
        }}
      >
        {children}
      </div>
    </Content>
  )
}
export default TimelineItem
