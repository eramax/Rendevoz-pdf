import { PrettyInput } from '@/components/custom/input/pretty'
import ColorPicker from '@/components/picker/colorPicker'
import classNames from 'classnames'
import { FC, ReactNode, useEffect, useRef, useState } from 'react'
import Content from '../Content'
import WithBorder from '../WithBorder'
import styles from './index.module.less'
import { useCanSubmit } from './useCanSubmit'
import { useIsSubmitted } from './useIsSubmitted'

type FormItemConditionalProps =
  | {
      onChange?: (value: string) => void
      text: string
      type: 'input' | 'textarea'
      onUpload?: never
      children?: never
    }
  | {
      type: 'file'
      onChange?: never
      text?: never
      onUpload: (file: File) => void
      children?: never
    }
  | {
      type: 'colorPicker'
      onChange?: (color: string) => void
      text?: string
      onUpload?: never
      children?: never
    }
  | {
      type: 'component'
      onChange?: never
      text?: string
      onUpload?: never
      children: ReactNode
    }
interface FormItemCommonProps {
  type: 'input' | 'textarea' | 'file' | 'colorPicker' | 'component'
  requireMessage?: string
  required?: boolean
}
type FormItemProps = FormItemCommonProps & FormItemConditionalProps
const FormItem: FC<FormItemProps> = ({ onChange, onUpload, text, type, children, required, requireMessage }) => {
  const [innerValue, setInnerValue] = useState<File | string>()
  const [color, setColor] = useState<string>()
  const [colorPickerVisible, setColorPickerVisible] = useState(false)
  const [isSubmitted] = useIsSubmitted()
  const [, setCanSubmit] = useCanSubmit()
  const fileUploaderRef = useRef<HTMLInputElement>(null)
  const isEmpty = innerValue === '' || innerValue === undefined || innerValue === null
  const childrenContainerClassName = classNames(styles.childrenContainer, required && isSubmitted && isEmpty ? styles.required : undefined)
  const childrenContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const childrenContainer = childrenContainerRef.current
    if (childrenContainer) {
      const child = childrenContainer.firstElementChild
      if (child) {
        if (type === 'input') {
          const input = child.querySelector('input')
          const inputMarginTop = parseInt(window.getComputedStyle(input).marginTop)
          const inputHeight = parseInt(window.getComputedStyle(input).height)
          const top = inputMarginTop + inputHeight / 2
          childrenContainer.setAttribute('style', `--top:${top}px`)
        }
      }
    }
  }, [])
  useEffect(() => {
    if (type === 'component') {
      return
    }
    if (isEmpty) {
      setCanSubmit(false)
    } else {
      setCanSubmit(true)
    }
  }, [innerValue])
  const childrenRenderer = () => {
    switch (type) {
      case 'input':
      case 'textarea':
        return (
          <PrettyInput
            className={styles.input}
            textarea={type === 'textarea'}
            displayText={text}
            onChange={e => {
              onChange?.(e.target.value)
              setInnerValue(e.target.value)
            }}
          ></PrettyInput>
        )
      case 'file': {
        const file = innerValue as File | undefined
        return (
          <div className={styles.file}>
            {file ? <span className={styles.filename}>Filename: {file.name}</span> : <span>Choose file</span>}
            {file ? (
              <button onClick={e => setInnerValue(undefined)} className={styles.button}>
                Cancel
              </button>
            ) : (
              <>
                <button className={styles.button} onClick={e => fileUploaderRef.current?.click()}>
                  Upload
                </button>
                <input
                  ref={fileUploaderRef}
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setInnerValue(file)
                      onUpload?.(file)
                    }
                  }}
                  type="file"
                />
              </>
            )}
          </div>
        )
      }
      case 'colorPicker':
        return (
          <Content flex alignItems="center" justifyContent="space-between">
            <span>{text}</span>
            <AnimatePopover
              containerStyle={{ zIndex: 999 }}
              padding={10}
              visible={colorPickerVisible}
              content={
                <WithBorder>
                  <ColorPicker
                    onPick={color => {
                      setColorPickerVisible(false)
                      setInnerValue(color)
                      onChange?.(color)
                    }}
                  />
                </WithBorder>
              }
            >
              <div
                onClick={() => setColorPickerVisible(!colorPickerVisible)}
                style={{
                  backgroundColor: color ?? 'white',
                  width: 40,
                  height: 25,
                  borderRadius: 4,
                  border: '1px solid #eee',
                  cursor: 'pointer'
                }}
              ></div>
            </AnimatePopover>
          </Content>
        )
      case 'component':
        return children
    }
  }

  const requireMessageRenderer = () => {
    return (
      <div
        style={{
          opacity: required && isSubmitted && isEmpty ? 1 : 0,
          userSelect: 'none',
          transition: 'opacity 0.2s ease',
          height: 18,
          color: 'red'
        }}
      >
        {requireMessage || ''}
      </div>
    )
  }
  return (
    <Content className={styles.itemContainer} flex column>
      <div ref={childrenContainerRef} className={childrenContainerClassName}>
        {childrenRenderer()}
      </div>
      {requireMessageRenderer()}
    </Content>
  )
}

export default FormItem
