import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Content, Icon } from '../base'
import SwitchAnimation from '../base/animation/SwitchAnimation'
import Menu from '../base/menu'
import NewDocumentDialog from './NewDocumentDialog'

const NewItemDialog = () => {
  const [item, setItem] = useState<'document' | null>(null)
  const nav = useNavigate()
  const renderChooseItemMenu = () => {
    return (
      <Menu>
        <Menu.Item type="button" icon={<Icon name="park-file-pdf-one" />} onClick={() => setItem('document')}>
          Pdf
        </Menu.Item>
        <Menu.Item
          type="button"
          icon={<Icon name="park-notes" />}
          onClick={() => {
            nav('/editor')
            setItem(null)
          }}
        >
          Note
        </Menu.Item>
      </Menu>
    )
  }
  const renderItem = () => {
    switch (item) {
      case 'document':
        return <NewDocumentDialog onBack={() => setItem(null)} />
    }
  }
  return (
    <Content style={{ width: 300, minHeight: 480 }}>
      <SwitchAnimation direction={!!item}>
        {switchWrapper => (item ? switchWrapper(renderItem(), 'item') : switchWrapper(renderChooseItemMenu(), 'menu'))}
      </SwitchAnimation>
    </Content>
  )
}

export default NewItemDialog
