import { OnSelectionChange, useSelectionContainer, OnSelectionEnd } from '@/components/dragSelector'
import React, { FC } from 'react'

export interface MouseSelectionProps {
  onSelectionChange: OnSelectionChange
  eventsElement: HTMLElement | Window | null
  onSelectionEnd: () => void
}

const DragSelection: FC<MouseSelectionProps> = ({ onSelectionChange, eventsElement, onSelectionEnd }) => {
  const { DragSelection } = useSelectionContainer({
    eventsElement,
    onSelectionChange,
    onSelectionEnd,
    selectionProps: {
      style: {
        border: '2px dashed purple',
        borderRadius: 2,
        opacity: 0.5,
        position: 'absolute',
        zIndex: 999999
      }
    }
  })

  return <DragSelection />
}

export default React.memo(DragSelection)
