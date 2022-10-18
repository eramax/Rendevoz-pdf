import { Input } from 'antd'
import { FC } from 'react'
import styles from './index.module.less'
interface WithPrefixInputProps{
  prefix: string
  enableTextArea?: boolean
  onChange?: (e: string) => void
  className?: string
  style?: React.CSSProperties
}
export const WithPrefixInput: FC<WithPrefixInputProps> = (props) => {
  const { prefix, enableTextArea, onChange, className, style } = props
  return (
    <div className={className} style={{ ...style, display: 'flex', justifyContent: 'space-between' }}>
      <div className={styles.prefix}>{prefix}</div>
      <div style={{ flexBasis: '60%', height: '100%', padding: '10px 0' }}>{enableTextArea ? <textarea onChange={e => onChange?.(e.target.value)}></textarea> : <input className={styles.input} onChange={e => onChange?.(e.target.value)}></input>}</div>
    </div>
  )
}
