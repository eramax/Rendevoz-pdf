import { toArray } from 'lodash'
import { cloneElement, CSSProperties, FC, ReactNode, Ref } from 'react'
import Content from '../Content'
import ToolbarItem from './ToolbarItem'
import ToolbarSeparator from './ToolbarSeparator'
import styles from './index.module.less'
import classNames from 'classnames'

export interface ToolbarProps {
  direction?: 'vertical' | 'horizontal'
  children?: ReactNode
  className?: string
  itemClassName?: string
  itemSpace?: number
  itemSize?: number
  itemClickPreventDefault?: boolean
  style?: CSSProperties
  ref?: Ref<HTMLDivElement>
}
interface IToolbar extends FC<ToolbarProps> {
  Item: typeof ToolbarItem
  Separator: typeof ToolbarSeparator
}
const Toolbar: IToolbar = ({
  className,
  children,
  direction = 'horizontal',
  itemSpace = 6,
  itemSize,
  itemClickPreventDefault = false,
  style,
  itemClassName,
  ref
}) => {
  let tools

  if (children) {
    tools = toArray(children).map((element, index) => {
      if (!element) {
        return element
      }
      return cloneElement(element, {
        key: index,
        direction: direction,
        space: itemSpace,
        size: itemSize,
        clickPreventDefault: itemClickPreventDefault,
        className: itemClassName
      })
    })
  }

  return (
    <Content ref={ref} style={style} flex centered className={classNames(styles.toolbar, className)} column={direction === 'vertical'}>
      {tools}
    </Content>
  )
}
Toolbar.Item = ToolbarItem
Toolbar.Separator = ToolbarSeparator

export default Toolbar
