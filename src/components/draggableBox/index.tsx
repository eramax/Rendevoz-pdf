import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import styles from './index.module.less'
import { Props, Rnd } from 'react-rnd'
import { IconButton } from '../custom/iconButton'
import { Dropdown, Popover, Tooltip } from 'antd'

export interface DraggableBoxProps extends Props {
  title?: string | React.ReactNode | undefined
  defaultVisible?: boolean
  visible: boolean
  onVisibleChange?: (visible: boolean) => void
  enableBackward?: boolean
  enableMore?: boolean
  dropdownMenu?: React.ReactNode
  onBackward?: () => void
}
export const DraggableBox: React.FC<DraggableBoxProps> = (props) => {
  const [draggable, setDraggable] = useState(true)
  const [show, setShow] = useState(props.defaultVisible || false)
  const [bodyScroll, setBodyScroll] = useState(false)
  const [timeout, setTo] = useState<NodeJS.Timeout | undefined>()
  const wrapperRef = useRef<Rnd>(null)
  const headerRef = useRef()
  useEffect(() => {
    setShow(props.visible)
  }, [props.visible])
  useEffect(() => {
    const listener = () => {
      triggerMouseEvent(headerRef.current, 'mouseover')
      triggerMouseEvent(headerRef.current, 'mousedown')
      triggerMouseEvent(document, 'mousemove')
      triggerMouseEvent(headerRef.current, 'mouseup')
      triggerMouseEvent(headerRef.current, 'click')
    }

    addEventListener('resize', listener)
    return () => removeEventListener('resize', listener)
  }, [])

  const triggerMouseEvent = (element, eventType) => {
    const mouseEvent = document.createEvent('MouseEvents')
    mouseEvent.initEvent(eventType, true, true)
    element.dispatchEvent(mouseEvent)
  }
  const handleStyles = {
    right: { right: '-10px' },
    bottom: { bottom: '-10px' }
  }
  const handleDraggable = () => {
    setDraggable(!draggable)
  }
  const handleClose = () => {
    setShow(false)
    props.onVisibleChange!(false)
  }
  return (
    <Rnd {...props} default={props.default} minWidth={300} minHeight={200} bounds='body' style={{ ...props.style, opacity: show ? 1 : 0, visibility: show ? 'visible' : 'hidden' }} ref={wrapperRef} className={styles.rnd} dragHandleClassName={styles.draggableBoxHeader} disableDragging={!draggable} resizeHandleStyles={handleStyles} >
      <div className={styles.draggableBoxWrapper}>
        <div style={{ cursor: draggable ? 'grab' : 'auto' }} ref={headerRef} className={styles.draggableBoxHeader}>
          <div className={styles.verticalLevelCenterFlex}>
            <span className={styles.title}>{props.title}</span>
          </div>
          <div className={styles.verticalLevelCenterFlex}>
            {props.draggable &&
            <Tooltip mouseEnterDelay={0.5} title='Pin'>
              <IconButton onClick={handleDraggable} name={draggable ? 'icon-pin' : 'icon-pin-fill'} />
            </Tooltip>}
            {props.dropdownMenu &&
            <Popover zIndex={10001} trigger='click' placement='bottom' content={props.dropdownMenu}>
              <IconButton name='icon-gengduo'/>
            </Popover>}
            {props.enableBackward
              ? <IconButton onClick={props?.onBackward} name='icon-fanhui' />
              : <IconButton onClick={handleClose} name='icon-close'/>}
          </div>
        </div>
        <div onScroll={(e) => { clearTimeout(timeout!); setBodyScroll(true); const to = setTimeout(() => { setBodyScroll(false) }, 800); setTo(to) }} className={bodyScroll ? styles.draggableBoxBody : `${styles.draggableBoxBody} ${styles.hideScrollBar}`}>
          <div className={styles.body}>
            {props.children}
          </div>
        </div>
      </div>
    </Rnd>
  )
}
