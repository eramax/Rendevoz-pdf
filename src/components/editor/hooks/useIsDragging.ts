import { atom, useAtom } from 'jotai'

const isDraggingAtom = atom(false)

const useIsDragging = () => useAtom(isDraggingAtom)

export default useIsDragging
