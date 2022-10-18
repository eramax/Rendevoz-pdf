import useEventEmitter from '@/events/useEventEmitter'
import { useToggle } from '@/hooks'
import Id from '@/utils/id'
import { DockContext, PanelData } from '../base/dock'
import Menu from '../base/menu'
import MenuItem from '../base/menu/MenuItem'
import Modal from '../base/modal'
import Icon from '../base/Icon'
import TreeCollectionRoot from '../treeCollection'

const EditorManagerMenu = ({ panel = {} as PanelData, context = {} as DockContext, onClose }) => {
  const emitter = useEventEmitter()
  const [v, toggle] = useToggle(false)
  return (
    <>
      <Modal visible={v} onClose={toggle} width={300}>
        <TreeCollectionRoot
          onChoose={id => {
            toggle()
            onClose?.()
            emitter.emit('editor', {
              type: 'insertTab',
              data: {
                panelId: panel.id,
                noteId: id,
                autoFocus: true
              }
            })
          }}
        />
      </Modal>
      <Menu>
        <MenuItem
          icon={<Icon name="park-plus" size={14} />}
          type="button"
          onClick={() => {
            onClose?.()
            emitter.emit('editor', {
              type: 'insertTab',
              data: {
                panelId: panel.id
              }
            })
          }}
        >
          New page
        </MenuItem>
        <MenuItem
          icon={<Icon name="park-folder-open" size={14} />}
          type="button"
          onClick={() => {
            toggle()
          }}
        >
          Open note in collections
        </MenuItem>
        {/* <MenuItem type="button">Search note</MenuItem> */}
        <Menu.Item
          type="button"
          icon={<Icon name="park-close" size={14} />}
          onClick={() => {
            emitter.emit('editor', {
              type: 'deletePanel',
              data: {
                panelId: panel.id
              }
            })
          }}
        >
          Close panel
        </Menu.Item>
      </Menu>
    </>
  )
}

export default EditorManagerMenu
