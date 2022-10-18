import { Children, cloneElement, FC, ReactElement, ReactNode } from 'react'
import TimelineItem from './TimelineItem'

interface TimelineProps {
  children?: ReactNode
  iconSize?: number
  iconColor?: string
}

interface ITimeline extends FC<TimelineProps> {
  Item: typeof TimelineItem
}

const Timeline: ITimeline = ({ children, iconSize }) => {
  const items = Children.toArray(children)
  const childrenItems = items
    .filter(i => !!i)
    .map((i: ReactElement<any>, idx, array) => {
      const length = array.length
      const isLast = idx === length - 1
      return cloneElement(i, {
        iconSize,
        hideTail: isLast
      })
    })
  return <ul>{childrenItems}</ul>
}
Timeline.Item = TimelineItem

export default Timeline
