import { AnimatePopover, Content, Icon } from '@/components'
import Tooltip from '@/components/base/Tooltip'
import { FC, useRef, useState, useEffect, MutableRefObject, useImperativeHandle, forwardRef } from 'react'

interface Props {
  disableNudge?: boolean
  disableCloseOutside?: boolean
  disableIntersection?: boolean
  name: string
  content: React.ReactNode
  tooltip?: string
  color?: string
  zIndex?: number
  defaultOpen?: boolean
  placement?: ('bottom' | 'top' | 'left' | 'right')[]
  size?: number
  innerRef?: MutableRefObject<any>
  parentElement?: HTMLElement
  padding?: number
  boundaryInset?: number
}
const IconWithPopover: FC<Props> = (
  {
    name,
    content,
    color,
    size = 18,
    defaultOpen = false,
    placement = ['top', 'right'],
    zIndex,
    innerRef,
    padding = 20,
    parentElement,
    disableNudge,
    tooltip,
    boundaryInset = 40,
    disableCloseOutside,
    disableIntersection
  },
  ref
) => {
  const containerRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const close = () => {
    setVisible(false)
  }
  useImperativeHandle(innerRef, () => ({ close }))
  useEffect(() => {
    if (defaultOpen) {
      setVisible(true)
    }
  }, [])
  return (
    <Content ref={containerRef}>
      <AnimatePopover
        padding={padding}
        onClickOutside={e => {
          if (e.path.some(i => i.getAttribute?.('role') === 'modal')) {
            return
          }
          if (!disableCloseOutside) {
            setVisible(false)
          }
        }}
        containerClassName={'zxcasd'}
        containerStyle={{ zIndex: zIndex?.toString() }}
        parentElement={containerRef.current}
        boundaryElement={document.body}
        boundaryInset={boundaryInset}
        visible={visible}
        positions={placement}
        content={content}
        disableNudge={disableNudge}
        disableIntersection={disableIntersection}
      >
        <Tooltip content={tooltip}>
          <Icon
            style={{ color }}
            cursor="pointer"
            size={size}
            onClick={e => {
              setVisible(!visible)
            }}
            name={name}
          />
        </Tooltip>
      </AnimatePopover>
    </Content>
  )
}

export default forwardRef(IconWithPopover)
