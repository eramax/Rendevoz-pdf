import { atom, useAtom } from 'jotai'

const draggingStateAtom = atom({
  isDragging: false,
  dragElementType: '',
  dragElementId: 0,
  dragOverElementType: '',
  dragOverElementName: '',
  canDrop: false
})
const useDraggingState = () => useAtom(draggingStateAtom)

export default useDraggingState
