import { Children, cloneElement, CSSProperties, FC, memo, MouseEventHandler, ReactElement, ReactNode, useEffect, useState } from 'react'
import Content from '../Content'
import { AnimatePresence, motion } from 'framer-motion'
import styles from './index.module.less'
import { useUnmount } from 'react-use'

export interface TabNavListProps {
  defaultActiveKey: string
  navs: {
    tab: string | ReactElement
    key: string
  }[]
  onTabClick: (key: string, e: MouseEvent) => void
  extra?: ReactNode
}
const TabNavList: FC<TabNavListProps> = ({ navs, onTabClick, defaultActiveKey, extra }) => {
  const [selectedTabKey, setSelectedTabKey] = useState(defaultActiveKey)
  useEffect(() => {
    if (defaultActiveKey) {
      setSelectedTabKey(defaultActiveKey)
    }
  }, [defaultActiveKey])
  return (
    <Content flex alignItems="center" justifyContent="space-between">
      <Content flex alignItems="center">
        {navs.map(nav => (
          <div
            className={styles.tabNav}
            onClick={e => {
              onTabClick(nav.key, e)
              setSelectedTabKey(nav.key)
            }}
            key={nav.key}
          >
            {nav.tab}
            {nav.key === selectedTabKey ? (
              <motion.div layout="position" className={styles.underline} initial={false} layoutId={navs[0].key} />
            ) : null}
          </div>
        ))}
      </Content>
      {extra}
    </Content>
  )
}
interface TabPanesListProps {
  activeKey: string
  tabPanes: TabPaneProps[]
}
const TabPanesList: FC<TabPanesListProps> = memo(({ activeKey, tabPanes }) => {
  return (
    <Content fullWidth fullHeight style={{ overflow: 'hidden' }}>
      <AnimatePresence exitBeforeEnter>
        {tabPanes.map(tabPane => (
          <TabPane
            onClick={tabPane.onClick}
            style={tabPane.style}
            key={tabPane.innerKey}
            active={activeKey === tabPane.innerKey}
            children={tabPane.children}
          />
        ))}
      </AnimatePresence>
    </Content>
  )
})

interface TabsProps {
  defaultActiveKey: string
  children: ReactElement<TabPaneProps> | ReactElement<TabPaneProps>[]
  extra?: ReactNode
  activeKey?: string
  onTabClick?: (key: string, e: MouseEvent) => void
  renderTabNav?: (defaultTabNav: TabNavListProps) => ReactNode
  disableInnerPanes?: boolean
}
export const Tabs: FC<TabsProps> = memo(
  ({ children, defaultActiveKey, onTabClick, renderTabNav, extra, disableInnerPanes = false, activeKey: outActiveKey }) => {
    let panes: ReactElement<TabPaneProps>[]
    if (!Array.isArray(children)) {
      panes = [children]
    } else {
      panes = children
    }

    const tabNavs = panes.map(c => {
      return {
        tab: c.props.tab,
        key: c.key
      }
    })
    const [activeKey, setActiveKey] = useState(defaultActiveKey || tabNavs[0]?.key)
    const onInternalTabClick = (key: string, e: MouseEvent) => {
      onTabClick?.(key, e)
      setActiveKey(key)
    }
    if (disableInnerPanes) {
      panes = panes.map(p =>
        cloneElement(p, {
          active: p.key === activeKey
        })
      )
    }
    useEffect(() => {
      if (outActiveKey) {
        setActiveKey(outActiveKey)
      }
    }, [outActiveKey])
    const tabPanes = panes.map(pane => ({ ...pane.props, innerKey: String(pane.key) }))
    const tabNavListRenderer = () =>
      renderTabNav ? (
        renderTabNav({ onTabClick: onInternalTabClick, defaultActiveKey: activeKey, navs: tabNavs, extra })
      ) : (
        <TabNavList onTabClick={onInternalTabClick} extra={extra} navs={tabNavs} defaultActiveKey={activeKey} />
      )
    return (
      <Content fullHeight flex column>
        {tabNavListRenderer()}
        {disableInnerPanes ? panes : <TabPanesList activeKey={activeKey} tabPanes={tabPanes} />}
      </Content>
    )
  }
)
interface TabPaneProps {
  onClick?: MouseEventHandler
  children: ReactNode
  tab: string | ReactElement
  innerKey?: string
  style?: CSSProperties
  active?: boolean
}
export const TabPane: FC<TabPaneProps> = memo(({ children, onClick, style, active }) => {
  const mergedStyle = { ...style }
  const variants = {
    hidden: {
      display: 'none',
      opacity: 0
    },
    visible: {
      opacity: 1
    }
  }

  return (
    <motion.div
      animate={active ? 'visible' : 'hidden'}
      variants={variants}
      className={styles.tabPane}
      style={mergedStyle}
      onClick={onClick}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.div>
  )
})
