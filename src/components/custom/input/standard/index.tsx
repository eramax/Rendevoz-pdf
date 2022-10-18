import { InputProps, Input } from 'antd'
import React, { useRef, useState } from 'react'

import styles from './index.module.less'

interface Props {
  input: InputProps
  buttonText?: string
  onSubmit?: () => void
  ref?: React.MutableRefObject<null>
}
export const StandardInput: React.FC<Props> = (props) => {
  const { input, buttonText, onSubmit } = props
  const [replyButton, setReplyButton] = useState(false)
  const ref = useRef(null)
  return (
    <>
      <div onBlur={() => { if (ref.current.state.value === '' || !ref.current.state.value) { setReplyButton(false) }; }} className={`${replyButton ? `${styles.CommentInput} ${styles.Collapse}` : `${styles.CommentInput}`}`}>
        <Input ref={ref} autoComplete="off" onChange={(e) => { input.onChange && input.onChange(e) }} value={input?.value || undefined} onFocus={() => { setReplyButton(true) }} placeholder={input?.placeholder}/>
        <div onClick={() => { onSubmit && onSubmit() }} className={`${replyButton ? `${styles.SubReplySubmitButton}` : `${styles.SubReplySubmitButton} ${styles.Collapse}`}`}>{buttonText}</div>
      </div>
    </>
  )

}
