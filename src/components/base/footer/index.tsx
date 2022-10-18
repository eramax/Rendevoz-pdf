import { Noop } from '@/common/types'
import { RippleButton } from '@/components/custom/rippleButton'
import { FC } from 'react'
import Content from '../Content'
import styles from './index.module.less'

interface FooterProps {
  submitText?: string
  backText?: string
  onSubmit?: Noop
  onBack?: Noop
}
const Footer: FC<FooterProps> = ({ onBack, onSubmit,submitText = 'Submit',backText = 'Back' }) => {
  return (
    <Content flex alignItems="center" justifyContent="space-between">
      <RippleButton className={styles.back} onClick={onBack}>
        {backText}
      </RippleButton>
      <RippleButton className={styles.submit} onClick={onSubmit}>
        {submitText}
      </RippleButton>
    </Content>
  )
}

export default Footer
