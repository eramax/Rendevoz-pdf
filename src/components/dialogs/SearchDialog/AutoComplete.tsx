import { Content } from '@/components/base'
import { css } from '@emotion/css'
import { CSSProperties, FC, MouseEventHandler } from 'react'

export const AutoComplete: FC<{
  value: string
  onClick: MouseEventHandler
}> = ({ value, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={css({
        fontSize: 15,
        fontWeight: 500,
        padding: '4px 10px',
        width: '100%',
        transition: 'background 0.3s ease',
        ':hover': {
          cursor: 'pointer',
          background: 'rgba(0,0,0,0.05)'
        }
      })}
    >
      {value}
    </div>
  )
}
const AutoCompleteList: FC<{ values: string[]; onClick: (value: string) => void; style?: CSSProperties }> = ({
  values,
  onClick,
  style
}) => {
  return (
    <Content style={style} flex column alignItems="flex-start">
      {values.map(i => (
        <AutoComplete value={i} onClick={() => onClick(i)} />
      ))}
    </Content>
  )
}

export default AutoCompleteList
