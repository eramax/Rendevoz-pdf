import { Noop } from '@/common/types'

export interface IDialog {
  onCancel?: Noop
  onSubmit?: Noop
}
