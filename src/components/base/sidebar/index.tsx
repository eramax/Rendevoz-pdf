import { FC, useRef, useState } from 'react'
import styles from './index.module.less'
import Navigation from './Nav'
import { Rnd } from 'react-rnd'
import { delay } from 'lodash'
import useSidebarWidth from '@/hooks/components/useSidebarWidth'
import Icon from '@/components/base/Icon'

export const Sidebar: FC = () => {
  const navRef = useRef<HTMLElement>(null)
  const rndRef = useRef<Rnd>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [widthTransition, setWidthTransition] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [, setSidebarWidth] = useSidebarWidth()
  return (
    <div
      tabIndex={-1}
      onMouseLeave={() => {
        if (!isResizing) setHovered(false)
      }}
    >
      <Rnd
        data-hovered={hovered}
        data-collapsed={collapsed}
        data-width-transition={widthTransition}
        ref={rndRef}
        default={{ width: 240, height: '100vh', x: 0, y: 0 }}
        position={{ x: 0, y: 0 }}
        className={styles.rnd}
        disableDragging
        enableResizing={{ right: hovered || !collapsed }}
        maxWidth={380}
        onResizeStart={() => {
          setIsResizing(true)
        }}
        onResize={(e, dir, ele) => {
          if (ele.clientWidth <= 100) {
            setHovered(false)
            setWidthTransition(true)
            delay(() => {
              setWidthTransition(false)
            }, 200)
            rndRef.current?.updateSize({ width: 20, height: '100vh' })
            setSidebarWidth(20)
            setCollapsed(true)
          }
        }}
        onResizeStop={(e, dir, ele) => {
          if (!collapsed) {
            setSidebarWidth(ele.clientWidth)
          }
          delay(() => {
            setIsResizing(false)
          }, 200)
          if (ele.clientWidth <= 200) {
            if (ele.clientWidth === 20) {
              rndRef.current?.updateSize({ width: 240, height: '100vh' })
              setSidebarWidth(20)
            } else {
              setWidthTransition(true)
              delay(() => {
                setWidthTransition(false)
              }, 200)
              if (!collapsed) {
                setSidebarWidth(240)
              }
              rndRef.current?.updateSize({ width: 240, height: '100vh' })
            }
          }
        }}
      >
        <nav
          onMouseEnter={e => {
            if (
              e.nativeEvent.path.some(i => i.getAttribute && (i.getAttribute('role') === 'modal' || i.getAttribute('role') === 'backdrop'))
            ) {
              return
            }
            if (!isResizing) setHovered(true)
          }}
          className={styles.nav}
          ref={navRef}
          onClick={() => setHovered(false)}
        >
          <Navigation></Navigation>
        </nav>
        <div className={styles.hide}>
          <Icon
            name={collapsed ? 'park-right' : 'park-left'}
            size={20}
            containerStyle={{ left: -5 }}
            fill="#8590ae"
            cursor="pointer"
            onClick={() => {
              if (collapsed) {
                setSidebarWidth(rndRef.current?.getSelfElement()?.clientWidth || 240)
                setCollapsed(false)
              } else {
                setHovered(false)
                setCollapsed(true)
                setSidebarWidth(20)
              }
            }}
            className={styles.toggleOpen}
          ></Icon>
        </div>
      </Rnd>
    </div>
  )
}
