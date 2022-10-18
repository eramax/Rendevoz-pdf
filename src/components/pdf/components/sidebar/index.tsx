import { Content, Icon } from '@/components'
import EditorManager from '@/components/editor/EditorManager'
import { TabPane, Tabs } from '@/components/base/tabs'
import NoteInfo from './NoteInfo'
import { FC, useEffect, useRef, useState } from 'react'
import { motion, PanInfo } from 'framer-motion'
import useCollapsed from '../../hooks/useCollapsed'

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useCollapsed()
  const [isAnimating, setIsAnimating] = useState(true)
  const dividerRef = useRef<HTMLDivElement>(null)
  const widthRef = useRef({
    prevWidth: 0,
    nextWidth: 0
  })
  const innerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const handleDrag = (e, info: PanInfo) => {
    const { x, y } = info.offset
    const handle = dividerRef.current
    const { prevWidth, nextWidth } = widthRef.current
    const prevEle = handle?.previousElementSibling as HTMLDivElement
    const nextEle = handle?.nextElementSibling as HTMLDivElement
    prevEle.style.width = `${prevWidth + x}px`
    nextEle.style.width = `${nextWidth - x}px`
  }
  const handleStartDrag = () => {
    const handle = dividerRef.current
    const prevEle = handle?.previousElementSibling
    const nextEle = handle?.nextElementSibling
    widthRef.current = {
      prevWidth: prevEle?.clientWidth,
      nextWidth: nextEle?.clientWidth
    }
  }
  const handleCollapse = (value: boolean) => {
    if (value === true) {
      const containerRect = containerRef.current?.getBoundingClientRect()
      innerRef.current.style.width = `${containerRect?.width}px`
    }
    setIsCollapsed(value)
  }
  useEffect(() => {
    if (!isCollapsed && !isAnimating) {
      innerRef.current.style.width = '100%'
    }
  }, [isAnimating])
  return (
    <>
      {!isCollapsed && (
        <motion.div
          ref={dividerRef}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragMomentum={false}
          onDrag={handleDrag}
          onDragStart={handleStartDrag}
          dragElastic={0}
          style={{
            width: '20px',
            position: 'relative',
            opacity: 0,
            height: 'calc(100vh - 100px)',
            pointerEvents: isAnimating ? 'none' : 'auto'
          }}
          whileHover={{ opacity: 1, cursor: 'col-resize' }}
          whileDrag={{ opacity: 1, cursor: 'col-resize' }}
        >
          <div
            style={{
              width: '4px',
              borderRadius: 999,
              height: '80%',
              background: 'rgba(0,0,0,0.1)',
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translateY(-50%) translateX(-50%)'
            }}
          ></div>
        </motion.div>
      )}
      {isCollapsed && (
        <div style={{ position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)', opacity: 1 }}>
          <Icon
            onClick={() => {
              !isAnimating && handleCollapse(false)
            }}
            name="park-double-left"
            size={20}
            fill="#8590ae"
            cursor="pointer"
          />
        </div>
      )}
      <motion.div
        role="sidebar-container"
        ref={containerRef}
        onAnimationStart={() => {
          setIsAnimating(true)
          document.body.style.overflow = 'hidden'
        }}
        onAnimationComplete={() => {
          setIsAnimating(false)
          document.body.style.overflow = 'unset'
        }}
        initial={{
          width: '40%'
        }}
        style={{
          position: 'relative',
          height: 'calc( 100vh - 100px )',
          overflow: 'hidden'
        }}
        animate={{
          width: isCollapsed ? '0%' : '40%'
        }}
        transition={{ duration: 0.8, type: 'keyframes' }}
      >
        <motion.div
          animate={{
            x: isCollapsed ? '100%' : undefined,
            opacity: isCollapsed ? 0 : 1
          }}
          ref={innerRef}
          role="sidebar-inner"
          style={{ height: '100%' }}
          transition={{ duration: 0.8, type: 'keyframes' }}
        >
          <Tabs
            defaultActiveKey="1"
            extra={
              <Icon
                size={20}
                fill="#8590ae"
                name="park-double-right"
                cursor="pointer"
                style={{ paddingRight: 20 }}
                onClick={() => handleCollapse(true)}
              />
            }
          >
            <TabPane tab="Editor" key="1">
              <div style={{ height: `100%`, position: 'relative', marginBottom: '20px' }}>
                <EditorManager />
              </div>
            </TabPane>
            <TabPane tab="Note" key="2">
              <NoteInfo />
            </TabPane>
          </Tabs>
        </motion.div>
      </motion.div>
    </>
  )
}
export default Sidebar
