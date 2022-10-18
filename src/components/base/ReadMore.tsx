import { useTheme, useToggle } from '@/hooks'
import { CSSProperties, FC, useEffect, useState } from 'react'
import Icon from './Icon'
import { Content } from '.'

interface ReadMoreProps {
  textLength?: number
  children: React.ReactNode
  style?: CSSProperties
}
const ReadMore: FC<ReadMoreProps> = ({ children, textLength = 150, style }) => {
  const text = children as string
  const [isReadMore, toggleReadMore] = useToggle(text.length > textLength)
  const { primaryColor } = useTheme('primaryColor')
  return (
    <Content style={{ wordBreak: 'break-word' }} flex column>
      <span
        style={{
          fontSize: '16',
          fontWeight: '600',
          whiteSpace: 'pre-line',
          ...style
        }}
      >
        {isReadMore ? text.slice(0, textLength).concat('...') : text}
      </span>
      {text.length > textLength && (
        <span
          style={{ color: primaryColor, fontSize: 12, cursor: 'pointer', fontStyle: 'italic', width: 'fit-content' }}
          onClick={e => {
            e.stopPropagation()
            toggleReadMore()
          }}
        >
          {isReadMore ? 'Read more' : 'Show less'}
        </span>
      )}
    </Content>
  )
}

export default ReadMore
