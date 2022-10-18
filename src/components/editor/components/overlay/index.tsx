import { Noop } from '@/common/types'
import { AnimatePopover, WithBorder } from '@/components/base'
import { PosHelper } from '@/components/contextMenu'
import EmojiPicker from '@/components/picker/emojiPicker'
import { EditorEventHandler } from '@/events/editorEvent'
import useEventEmitter from '@/events/useEventEmitter'
import { FC, useEffect, useState } from 'react'
import DragHandleMenu from '../menu/DragHandleMenu'

interface OverlayProps {
  visible: boolean
  onVisiblityChange: (visiblity: boolean) => void
}
type Position = {
  left?: number
  top?: number
}
const EditorOverlay: FC<OverlayProps> = ({ visible, onVisiblityChange }) => {
  const [position, setPosition] = useState<Position>()
  const [content, setContent] = useState<'dragHandleMenu' | 'emojiPicker'>()
  const emitter = useEventEmitter()
  const handler = new EditorEventHandler()
  handler.on('toggleOverlay', data => {
    setPosition({ top: data.top, left: data.left })
    setContent(data.content)
    onVisiblityChange(true)
    console.log(data)
  })
  useEffect(() => {
    emitter.addListener('editor', handler)
    return () => {
      emitter.removeListener('editor', handler)
    }
  }, [])
  const positions = (): string[] => {
    switch (content) {
      case 'dragHandleMenu':
        return ['left', 'right']
      case 'emojiPicker':
        return ['bottom']
      default:
        return ['left']
    }
  }
  return (
    <AnimatePopover
      positions={positions()}
      padding={20}
      onClickOutside={() => onVisiblityChange(false)}
      visible={visible}
      content={
        <>
          {content === 'dragHandleMenu' && <DragHandleMenu />}
          {content === 'emojiPicker' && (
            <WithBorder>
              <EmojiPicker
                onPick={name => {
                  emitter.emit('editor', {
                    type: 'insertNode',
                    data: {
                      element:{
                        type: 'emoji',
                        name,
                        children: [{text: ''}]
                      }
                    }
                  })
                }}
              />
            </WithBorder>
          )}
        </>
      }
    >
      <PosHelper {...position}></PosHelper>
    </AnimatePopover>
  )
}

export default EditorOverlay
