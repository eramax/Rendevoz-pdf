import { FC, MouseEvent } from 'react'
import { useContextMenu } from '../contextMenu/ContextMenuProvider'
import Menu from '../base/menu'

interface Props {
  onAddThought?: (mousePos) => void
  onShouldCloseContextMenu: () => void
}
const PdfContextMenu: FC<Props> = ({ onShouldCloseContextMenu, onAddThought }) => {
  const mousePos = useContextMenu()
  const handleAddThought = (e: MouseEvent) => {
    onAddThought?.(mousePos)
    onShouldCloseContextMenu()
    e.stopPropagation()
  }
  return (
    <Menu>
      <Menu.Item onClick={handleAddThought} type="button">
        Thought
      </Menu.Item>
    </Menu>
  )
}
export default PdfContextMenu
