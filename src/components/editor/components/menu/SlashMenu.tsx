import { Noop } from '@/common/types'
import { AnimatePopover, WithBorder, Content } from '@/components'
import { PosHelper } from '@/components/contextMenu'
import { PrettyInput } from '@/components/custom/input/pretty'
import { FC, useEffect, useState } from 'react'

interface SlashMenuProps {
  visible: boolean
  onClose: Noop
}

const SlashMenu: FC<SlashMenuProps> = ({ visible, onClose }) => {
  const [position, setPosition] = useState<DOMRect>()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (visible) {
      setPosition(window.getSelection()?.getRangeAt(0)?.getBoundingClientRect())
    }
  }, [visible])
  return (
    <AnimatePopover
      positions={['bottom']}
      padding={10}
      align="start"
      content={
        <WithBorder>
          <Content flex column>
            <PrettyInput
              displayText="Search"
              onChange={e => {
                setSearch(e.target.value)
              }}
            />
          </Content>
        </WithBorder>
      }
      visible={visible}
      onClickOutside={onClose}
    >
      <PosHelper left={position?.left} top={position?.top + position?.height} />
    </AnimatePopover>
  )
}

export default SlashMenu
