import { RippleButton } from '@/components/custom/rippleButton'
import { Provider } from 'jotai'
import { createContext, CSSProperties, FC, useState } from 'react'
import Content from '../Content'
import FormItem from './FormItem'
import styles from './index.module.less'
import { useCanSubmit } from './useCanSubmit'
import { useIsSubmitted } from './useIsSubmitted'

interface FormProps {
  children: React.ReactNode
  title: string
  description?: string
  onBack?: () => void
  onSubmit?: () => void
  style?: CSSProperties
}
interface IForm extends FC<FormProps> {
  Item: typeof FormItem
}
const InnerForm: FC<FormProps> = ({ children, title, description, onBack, onSubmit, style }) => {
  const [, setIsSubmitted] = useIsSubmitted()
  const [canSubmit] = useCanSubmit()
  return (
    <div className={styles.form} style={style}>
      <Content flex column>
        <div className={styles.title}>{title}</div>
        {description && <div className={styles.description}>{description}</div>}
        {children}
      </Content>
      <div className={styles.toolbar}>
        <RippleButton
          className={styles.back}
          onClick={() => {
            onBack?.()
          }}
        >
          Back
        </RippleButton>
        <RippleButton
          className={styles.submit}
          onClick={() => {
            if (canSubmit) {
              onSubmit?.()
            }
            setIsSubmitted(true)
          }}
        >
          Submit
        </RippleButton>
      </div>
    </div>
  )
}
const Form: IForm = props => (
  <Provider>
    <InnerForm {...props} />
  </Provider>
)
Form.Item = FormItem
export default Form
