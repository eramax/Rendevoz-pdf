import { Content, Icon, Toolbar } from '@/components'
import _ from 'lodash'
import { FC } from 'react'
import styles from './index.module.less'

interface IconPickerProps {
  icons: string[]
  rowSize?: number
  onIconPick: (icon: string) => void
}
const IconPicker: FC<IconPickerProps> = ({ icons, onIconPick, rowSize = 5 }) => {
  return (
    <Content style={{ padding: 4 }} flex column>
      {_.chunk(icons, rowSize).map(i => (
        <Toolbar>
          {i.map(ii => (
            <Toolbar.Item onClick={() => onIconPick(ii)} iconName={ii}></Toolbar.Item>
          ))}
        </Toolbar>
      ))}
    </Content>
  )
}
export default IconPicker
