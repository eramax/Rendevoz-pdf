import Icon from '@/components/base/Icon'
import useEventEmitter from '@/events/useEventEmitter'
import Id from '@/utils/id'
import classNames from 'classnames'
import { cloneElement, FC, useState } from 'react'
import { RenderElementProps } from 'slate-react'
import { HeadingElement, HeadingOneElement, HeadingThreeElement, HeadingTwoElement } from '../../customTypes'
import { ElementBuilder } from '../elementBuilder'
import styles from './index.module.less'

export interface HeadingProps {
  level: 0 | 1 | 2 | 3 | 4 | 5
  title?: string
  dest?: string
}
export const Heading: FC<RenderElementProps & HeadingProps> = ({ element, children, level }) => {
  const { dest } = element as HeadingElement
  const emitter = useEventEmitter()
  const [folded, setFolded] = useState(false)
  const action = () => {
    const clazzName = classNames(styles.extra, folded && styles.folded)
    return (
      <span className={clazzName} contentEditable={false}>
        <div
          onClick={() => {
            setFolded(!folded)
            emitter.emit('editor', {
              type: 'foldHeading',
              data: {
                headingId: element.id,
                folded: !folded
              }
            })
          }}
        >
          {folded ? <Icon theme="filled" name="park-down-one" /> : <Icon theme="filled" name="park-right-one" />}
        </div>
      </span>
    )
  }
  const link = () => {
    if (dest) {
      return (
        <Icon
          cursor="pointer"
          onClick={() => {
            emitter.emit('pdf', {
              type: 'jumpToDest',
              data: {
                dest: dest
              }
            })
          }}
          name="park-link"
        />
      )
    }
  }
  const heading = () => {
    switch (level) {
      case 0:
        return <h1></h1>
      case 1:
        return <h2></h2>
      case 2:
        return <h3></h3>
      default:
        return <h1></h1>
    }
  }
  return cloneElement(
    heading(),
    {
      id: element.id,
      className: styles.heading,
    },
    // action(),
    children,
    link()
  )
}

export const HeadingElementBuilder: ElementBuilder<HeadingOneElement | HeadingTwoElement | HeadingThreeElement> = {
  build: (heading: HeadingProps) => {
    let type: string
    switch (heading.level) {
      case 0:
        type = 'heading-one'
        break
      case 1:
        type = 'heading-two'
        break
      case 2:
        type = 'heading-three'
        break
      case 3:
        type = 'heading-four'
        break
      case 4:
        type = 'heading-five'
        break
      case 5:
        type = 'heading-six'
        break
    }
    return {
      type: type,
      id: Id.getId(),
      dest: heading.dest,
      children: [{ text: heading.title }]
    }
  }
}
