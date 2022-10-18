import { DragEventHandler, FC, forwardRef } from 'react'
import { Property } from 'csstype'

interface ContentProps {
  position?: 'absolute' | 'relative' | 'fixed'
  flex?: boolean
  column?: boolean
  alignItems?: Property.AlignItems
  justifyContent?: Property.JustifyContent
  gap?: number
  centered?: boolean
  children?: React.ReactNode
  className?: string
  fullWidth?: boolean
  fullHeight?: boolean
  auto?: boolean
  style?: React.CSSProperties
  draggable?: boolean
  onClick?: React.MouseEventHandler<HTMLDivElement>
  onMouseDown?: React.MouseEventHandler
  onMouseEnter?: React.MouseEventHandler
  onMouseLeave?: React.MouseEventHandler
  onDragStart?: DragEventHandler
  onDragEnd?: DragEventHandler
  onDrag?: DragEventHandler
  onDragOver?: DragEventHandler
  onDragEnter?: DragEventHandler
}
const Content = forwardRef<HTMLDivElement, ContentProps>(
  (
    {
      style,
      position = 'relative',
      flex,
      auto,
      column,
      justifyContent,
      alignItems,
      gap,
      centered,
      className,
      fullWidth,
      fullHeight,
      children,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onDragStart,
      onDragEnter,
      onDragEnd,
      onDragOver,
      onDrag,
      draggable
    },
    ref
  ) => {
    const Style: React.CSSProperties = {
      position: position,
      display: flex ? 'flex' : 'block',
      flexDirection: flex && column ? 'column' : 'row',
      justifyContent: centered ? 'center' : justifyContent,
      alignItems: centered ? 'center' : alignItems,
      flex: auto ? 'auto' : undefined,
      width: fullWidth ? '100%' : undefined,
      height: fullHeight ? '100%' : undefined,
      gap,
      ...style
    }
    return (
      <div
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDrag={onDrag}
        draggable={draggable}
        onClick={onClick}
        ref={ref}
        className={className}
        style={Style}
      >
        {children}
      </div>
    )
  }
)

export default Content
