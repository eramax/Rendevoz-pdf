import React from 'react'
import { DockContext, DockContextType, DropDirection, PanelData, TabData, TabGroup } from './DockData'
import * as DragManager from './dragdrop/DragManager'
import { DragDropDiv } from './dragdrop/DragDropDiv'
import { DockTabBar } from './DockTabBar'
import DockTabPane from './DockTabPane'
import { getFloatPanelSize } from './Algorithm'
import { TabNavListProps, Tabs } from '../tabs'
import styles from './index.module.less'
import Icon from '@/components/base/Icon'

function findParentPanel(element: HTMLElement) {
  for (let i = 0; i < 10; ++i) {
    if (!element) {
      return null
    }
    if (element.classList.contains('dock-panel')) {
      return element
    }
    element = element.parentElement
  }
  return null
}

export class TabCache {
  _ref: HTMLDivElement
  getRef = (r: HTMLDivElement) => {
    this._ref = r
  }

  _hitAreaRef: HTMLDivElement
  getHitAreaRef = (r: HTMLDivElement) => {
    this._hitAreaRef = r
  }

  data: TabData
  context: DockContext
  content: React.ReactElement

  constructor(context: DockContext) {
    this.context = context
  }

  setData(data: TabData) {
    if (data !== this.data) {
      this.data = data
      this.content = this.render()
      return true
    }
    return false
  }

  onCloseClick = (e: React.MouseEvent) => {
    this.context.dockMove(this.data, null, 'remove')
    this.context.getGlobal().onTabClose?.(this.data)
    e.stopPropagation()
  }

  onDragStart = (e: DragManager.DragState) => {
    const panel = this.data.parent
    const panelElement = findParentPanel(this._ref)
    const tabGroup = this.context.getGroup(this.data.group)
    const [panelWidth, panelHeight] = getFloatPanelSize(panelElement, tabGroup)
    console.log(this._ref.parentElement)
    e.setData({ tab: this.data, panelSize: [panelWidth, panelHeight] }, this.context.getDockId())
    e.startDrag(this._ref.parentElement, this._ref.parentElement)
  }
  onDragOver = (e: DragManager.DragState) => {
    const dockId = this.context.getDockId()
    const tab: TabData = DragManager.DragState.getData('tab', dockId)
    let panel: PanelData = DragManager.DragState.getData('panel', dockId)
    let group: string
    if (tab) {
      panel = tab.parent
      group = tab.group
    } else {
      // drag whole panel
      if (!panel) {
        return
      }
      if (panel?.panelLock) {
        e.reject()
        return
      }
      group = panel.group
    }
    const tabGroup = this.context.getGroup(group)

    if (group !== this.data.group) {
      e.reject()
    } else if (tabGroup?.floatable === 'singleTab' && this.data.parent?.parent?.mode === 'float') {
      e.reject()
    } else if (tab && tab !== this.data) {
      const direction = this.getDropDirection(e)
      // only show drop rect in different panels
      if (tab.parent !== this.data.parent) {
        this.context.setDropRect(this._hitAreaRef, direction, this)
      }
      e.accept('')
    } else if (panel && panel !== this.data.parent) {
      const direction = this.getDropDirection(e)
      this.context.setDropRect(this._hitAreaRef, direction, this)
      e.accept('')
    }
  }
  onDragLeave = (e: DragManager.DragState) => {
    this.context.setDropRect(null, 'remove', this)
  }
  onDrop = (e: DragManager.DragState) => {
    console.log('drag drop')
    const dockId = this.context.getDockId()
    let panel: PanelData
    const tab: TabData = DragManager.DragState.getData('tab', dockId)
    if (tab) {
      panel = tab.parent
    } else {
      panel = DragManager.DragState.getData('panel', dockId)
    }
    if (tab && tab !== this.data) {
      const direction = this.getDropDirection(e)
      this.context.dockMove(tab, this.data, direction)
    } else if (panel && panel !== this.data.parent) {
      const direction = this.getDropDirection(e)
      this.context.dockMove(panel, this.data, direction)
    }
  }

  getDropDirection(e: DragManager.DragState): DropDirection {
    console.log('get direction')
    const rect = this._hitAreaRef.getBoundingClientRect()
    const midx = rect.left + rect.width * 0.5
    return e.clientX > midx ? 'after-tab' : 'before-tab'
  }

  render(): React.ReactElement {
    let { id, title, group, onTabClick, content, closable, cached, parent } = this.data
    const { onDragStart, onDragOver, onDrop, onDragLeave } = this

    if (typeof content === 'function') {
      content = content(this.data)
    }
    const tab = (
      <DragDropDiv
        getRef={this.getRef}
        onDragStartT={onDragStart}
        role="tab"
        aria-selected={parent.activeId === id}
        onDragOverT={onDragOver}
        onDropT={onDrop}
        onDragLeaveT={onDragLeave}
        onClick={onTabClick}
        key={`${id}_tab`}
        id={`${id}_tab`}
      >
        <div className={styles.title}>{title}</div>
        <div className={styles.closeButtonWrapper}>
          <Icon className={styles.closeButton} size={12} onClick={this.onCloseClick} name="park-close" />
        </div>
        <div className="dock-tab-hit-area" ref={this.getHitAreaRef} />
      </DragDropDiv>
    )

    return (
      <DockTabPane parent={parent} key={id} cacheId={id} cached={cached} tab={tab} forceRender>
        {content}
      </DockTabPane>
    )
  }

  destroy() {
    // place holder
  }
}

interface Props {
  panelData: PanelData
}

export class DockTabs extends React.PureComponent<Props, any> {
  static contextType = DockContextType

  static readonly propKeys = ['group', 'tabs', 'activeId', 'onTabChange']

  context!: DockContext
  _cache: Map<string, TabCache> = new Map()

  cachedTabs: TabData[]

  updateTabs(tabs: TabData[]) {
    if (tabs === this.cachedTabs) {
      return
    }
    this.cachedTabs = tabs
    const newCache = new Map<string, TabCache>()
    let reused = 0
    for (const tabData of tabs) {
      const { id } = tabData
      if (this._cache.has(id)) {
        const tab = this._cache.get(id)
        newCache.set(id, tab)
        tab.setData(tabData)
        ++reused
      } else {
        const tab = new TabCache(this.context)
        newCache.set(id, tab)
        tab.setData(tabData)
      }
    }
    if (reused !== this._cache.size) {
      for (const [id, tab] of this._cache) {
        if (!newCache.has(id)) {
          tab.destroy()
        }
      }
    }
    this._cache = newCache
  }

  renderTabBar = (defaultTabNav: TabNavListProps) => {
    const { panelData } = this.props
    const { group: groupName, panelLock } = panelData
    const group = this.context.getGroup(groupName)
    const global = this.context.getGlobal()
    const { globalPanelExtra } = global
    let { panelExtra } = group

    if (panelLock) {
      if (panelLock.panelExtra) {
        panelExtra = panelLock.panelExtra
      }
    }

    let panelExtraContent: React.ReactElement | undefined = undefined
    if (panelExtra) {
      panelExtraContent = panelExtra(panelData, this.context)
    }
    if (globalPanelExtra) {
      panelExtraContent = globalPanelExtra(panelData, this.context)
    }
    return (
      <DockTabBar
        onReorder={(sourceId, destId, direction) => {
          this.context.dockMove(this.context.find(sourceId), this.context.find(destId), direction)
        }}
        TabNavList={defaultTabNav}
        panelData={panelData}
        extraArea={panelExtraContent}
      />
    )
  }

  onTabChange = (activeId: string) => {
    this.props.panelData.activeId = activeId
    this.context.onSilentChange(activeId, 'active')
    this.forceUpdate()
  }

  render(): React.ReactNode {
    const { group, tabs, activeId } = this.props.panelData
    const tabGroup = this.context.getGroup(group)
    let { animated } = tabGroup
    if (animated == null) {
      animated = true
    }
    this.updateTabs(tabs)

    const children: React.ReactNode[] = []
    for (const [id, tab] of this._cache) {
      children.push(tab.content)
    }
    return (
      <Tabs activeKey={activeId} onTabClick={key => this.onTabChange(key)} renderTabNav={this.renderTabBar} disableInnerPanes>
        {children}
      </Tabs>
    )
  }
}
