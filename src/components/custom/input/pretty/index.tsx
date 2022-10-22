import { useMount } from '@/hooks'
import React, { useRef, useState, useEffect, forwardRef } from 'react'
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
  value?: string
}
export const PrettyInput: React.FC<Props> = forwardRef((props, ref) => {
  const {
    onChange,
    displayText,
    className,
    type,
    textarea,
    defaultValue = '',
    onClick,
    defaultFocused = false,
    value: externalValue,
    style
  } = props
  const [small, setSmall] = useState(false)
  const [value, setValue] = useState(defaultValue)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>()
  const isCompositionRef = useRef(false)
  const [focused, setFocused] = useState(defaultFocused)
  useMount(() => {
    if (defaultFocused) {
      inputRef.current?.focus()
    }
  })
  useEffect(() => {
    setValue(externalValue)
  }, [externalValue])
  return (
    <div
      ref={ref}
      onClick={onClick}
      tabIndex={props.tabIndex}
      style={{ height: textarea ? 'auto' : '52px', ...style }}
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
          onCompositionStart={() => (isCompositionRef.current = true)}
          onCompositionEnd={e => {
            isCompositionRef.current = false
            onChange(e)
          }}
          onChange={e => {
            const isComposition = isCompositionRef.current
            setValue(e.target.value)
            if (isComposition) {
              return
            } else {
              onChange(e)
            }
          }}
        />
      ) : (
        <input
          spellCheck="false"
          type={type}
          value={value}
          onCompositionStart={() => (isCompositionRef.current = true)}
          onCompositionEnd={e => {
            isCompositionRef.current = false
            onChange(e)
          }}
          onChange={e => {
            const isComposition = isCompositionRef.current
            setValue(e.target.value)
            if (isComposition) {
              return
            } else {
              onChange(e)
            }
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
})
