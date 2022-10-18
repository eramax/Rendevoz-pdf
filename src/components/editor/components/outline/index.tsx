import { Content } from '@/components/base'
import useThrottleFn from '@/hooks/utils/useThrottleFn'
import React, { useEffect, useState } from 'react'
import { Descendant } from 'slate'

import Outliner, { HeadingListNode } from '../../utils/outline/outliner'
import styles from './index.module.less'

interface OutlineProps {
  currentHeadingId?: number
  editorValue: Descendant[]
  onOutlineClick?: (id: number) => void
}
const Outline: React.FC<OutlineProps> = ({ currentHeadingId, editorValue, onOutlineClick }) => {
  const [outlineList, setOutlineList] = useState<HeadingListNode[]>([])
  const { flattenHeadingTree, headingListToTree } = Outliner
  const buildOutline = () => {
    setOutlineList(flattenHeadingTree(headingListToTree(editorValue)))
  }
  const { run } = useThrottleFn(() => buildOutline(), { wait: 2000 })
  useEffect(() => {
    run()
  }, [editorValue])
  const classNamePicker = (level: number) => {
    switch (level) {
      case 1:
        return styles.headingOne
      case 2:
        return styles.headingTwo
      case 3:
        return styles.headingThree
      case 4:
        return styles.headingFour
      case 5:
        return styles.headingFive
      case 6:
        return styles.headingSix
      default:
        return styles.headingOne
    }
  }
  return (
    <Content flex column key="asd">
      <Content flex alignItems="center">
        <h5>Outline</h5>
      </Content>
      {outlineList.map((i, idx) => (
        <div
          key={idx}
          onClick={e => onOutlineClick?.(i.id)}
          style={{ fontSize: i.id === currentHeadingId ? '30px' : '15px' }}
          className={`${styles.outline} ${classNamePicker(i.level)}`}
        >
          <span>{i.text}</span>
        </div>
      ))}
    </Content>
  )
}

export default Outline
