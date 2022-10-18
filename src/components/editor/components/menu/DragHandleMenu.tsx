import Menu from '@/components/base/menu'
import useEventEmitter from '@/events/useEventEmitter'

const DragHandleMenu = () => {
  const emitter = useEventEmitter()
  return (
    <Menu>
      <Menu.Item type="button" onClick={() => emitter.emit('editor', { type: 'toggleThoughtLayer' })}>
        Add to mindmap
      </Menu.Item>
      <Menu.Item type="button" onClick={() => emitter.emit('editor', { type: 'toggleThoughtLayer' })}>
        Add to mindmap
      </Menu.Item>
    </Menu>
  )
}

export default DragHandleMenu
