import { useMount } from '@/hooks'
import { Input } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import React, { useRef, useState } from 'react'
import AutosizeTextarea from '../autosizeTextarea'
import styles from './index.module.less'

interface Props {
  displayText: string
  onChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
  className?: string
  defaultFocused?: boolean
  type?: string
  tabIndex?: number
  style?: React.CSSProperties
  textarea?: boolean
  defaultValue?: string
  onClick?: React.MouseEventHandler<HTMLDivElement>
}
export const PrettyInput: React.FC<Props> = props => {
  const { onChange, displayText, className, type, textarea, defaultValue = '', onClick, defaultFocused = false } = props
  const [small, setSmall] = useState(false)
  const [value, setValue] = useState(defaultValue)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>()
  const [focused, setFocused] = useState(defaultFocused)
  useMount(() => {
    if (defaultFocused) {
      inputRef.current?.focus()
    }
  })
  return (
    <div
      onClick={onClick}
      tabIndex={props.tabIndex}
      style={{ height: textarea ? 'auto' : '52px' }}
      className={`${styles.LoginInput} ${className} ${focused ? `${styles.focused}` : undefined}`}
      onFocus={() => {
        setSmall(true)
      }}
      onBlur={() => {
        setSmall(false)
      }}
    >
      {textarea ? (
        <AutosizeTextarea
          spellCheck={false}
          minRows={2}
          maxRows={10}
          ref={inputRef}
          value={value}
          style={{ resize: 'none' }}
          className={styles.Input}
          onFocus={() => {
            setSmall(true)
            setFocused(true)
          }}
          onBlur={() => {
            setFocused(false)
          }}
          onChange={e => {
            onChange(e)
            setValue(e.target.value)
          }}
        />
      ) : (
        <input
          spellCheck="false"
          type={type}
          value={value}
          onChange={e => {
            onChange(e)
            setValue(e.target.value)
          }}
          className={styles.Input}
          ref={inputRef}
          onFocus={() => {
            setSmall(true)
            setFocused(true)
          }}
          onBlur={() => {
            setFocused(false)
          }}
        ></input>
      )}
      <div className={styles.DisplayText}>
        <div className={small || value !== '' ? `${styles.Text} ${styles.Small}` : styles.Text}>
          <span>{displayText}</span>
        </div>
      </div>
    </div>
  )
}
