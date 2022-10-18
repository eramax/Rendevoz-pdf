import React, { memo, useEffect, useRef, useState } from 'react'
import { DragDropDiv } from './dragdrop/DragDropDiv'
import * as DragManager from './dragdrop/DragManager'
import { DockContextType, PanelData } from './DockData'
import styles from './index.module.less'

import './bar.less'
import { Reorder, motion, AnimatePresence } from 'framer-motion'
import { TabNavListProps } from '../tabs'
import classNames from 'classnames'

interface DockTabBarProps {
  TabNavList: TabNavListProps
  onReorder: (sourceId: string, destId: string, direction: 'after' | 'before') => void
  panelData: PanelData
  extraArea: React.ReactNode
}

export const DockTabBar = memo((props: DockTabBarProps) => {
  const { TabNavList, onReorder, ...restProps } = props

  const ref = React.useRef<HTMLDivElement>()
  const getRef = (div: HTMLDivElement) => {
    ref.current = div
  }
  const selectedTabKey = TabNavList.defaultActiveKey

  const navs = TabNavList.navs
  const currentMoveTabId = useRef<string>()

  return (
    <DragDropDiv role="tablist" className="dock-bar" getRef={getRef} tabIndex={-1}>
      <Reorder.Group
        onReorder={r => {
          const currIndex = r.findIndex(i => i.key === currentMoveTabId.current)
          const prevIndex = navs.findIndex(i => i.key === currentMoveTabId.current)
          const direction = currIndex > prevIndex ? 'after-tab' : 'before-tab'
          onReorder(currentMoveTabId.current, navs[currIndex].key, direction)
        }}
        className={styles.tabs}
        values={navs}
        axis="x"
      >
        <AnimatePresence initial={false}>
          {navs.map(i => (
            <TabItem
              item={i}
              key={i.key}
              onDragStart={() => {
                currentMoveTabId.current = i.key
              }}
              isSelected={selectedTabKey === i.key}
              onClick={e => {
                TabNavList.onTabClick(i.key, e)
              }}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>
      {restProps.extraArea}
    </DragDropDiv>
  )
})

const TabItem = memo(({ onClick, isSelected, item, onDragStart }) => {
  return (
    <Reorder.Item
      key={item.key}
      initial={{ opacity: 0, background: 'white' }}
      animate={{
        opacity: 1,
        transition: { duration: 0.2 },
        color: isSelected ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0.4)',
      }}
      onDragStart={onDragStart}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      onClick={onClick}
      value={item}
      drag={true}
      whileDrag={{ opacity: 0, transition: { duration: 0 } }}
      aria-label="tab-reorder-item"
      as="div"
      id={item.key}
      className={classNames(styles.tab, isSelected && styles.active)}
    >
      {isSelected && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.pointer}></motion.div>}
      <motion.div layout= "position" className={styles.tabContent}>
        {item.tab}
      </motion.div>
    </Reorder.Item>
  )
})
