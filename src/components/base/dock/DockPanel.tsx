import React from 'react'
import { DockContext, DockContextType, LayoutData, PanelData, TabData, TabGroup } from './DockData'
import { DockTabs } from './DockTabs'
import { DragDropDiv } from './dragdrop/DragDropDiv'
import { DragState } from './dragdrop/DragManager'
import { DockDropLayer } from './DockDropLayer'
import { DockDropEdge } from './DockDropEdge'

interface Props {
  panelData: PanelData
  size: number
}

interface State {
  dropFromPanel: PanelData
  draggingHeader: boolean
}

export class DockPanel extends React.PureComponent<Props, State> {
  static contextType = DockContextType

  context!: DockContext

  _ref: HTMLDivElement
  getRef = (r: HTMLDivElement) => {
    this._ref = r
    if (r) {
      const { parent } = this.props.panelData
    }
  }

  static _droppingPanel: DockPanel
  static set droppingPanel(panel: DockPanel) {
    if (DockPanel._droppingPanel === panel) {
      return
    }
    if (DockPanel._droppingPanel) {
      DockPanel._droppingPanel.onDragOverOtherPanel()
    }
    DockPanel._droppingPanel = panel
  }

  state: State = { dropFromPanel: null, draggingHeader: false }

  onDragOver = (e: DragState) => {
    if (DockPanel._droppingPanel === this) {
      return
    }
    const { panelData } = this.props
    const dockId = this.context.getDockId()
    const tab: TabData = DragState.getData('tab', dockId)
    const panel: PanelData = DragState.getData('panel', dockId)
    if (tab || panel) {
      DockPanel.droppingPanel = this
    }
    if (tab) {
      if (tab.parent) {
        this.setState({ dropFromPanel: tab.parent })
      } else {
        // add a fake panel
        this.setState({ dropFromPanel: { activeId: '', tabs: [], group: tab.group } })
      }
    } else if (panel) {
      this.setState({ dropFromPanel: panel })
    }
  }

  onDragOverOtherPanel() {
    if (this.state.dropFromPanel) {
      this.setState({ dropFromPanel: null })
    }
  }

  // used both by dragging head and corner
  _movingX: number
  _movingY: number
  // drop to move in float mode

  _movingW: number
  _movingH: number
  _movingCorner: string

  onPanelClicked = (e: React.MouseEvent) => {
    const target = e.nativeEvent.target
    const layout = this.context.getLayout()
    const newLayout: LayoutData = {
      ...layout,
      global: {
        ...layout.global,
        currentFocusedPanelId: this.props.panelData.id
      }
    }
    this.context.setLayout(newLayout)
    if (!this._ref.contains(this._ref.ownerDocument.activeElement) && target instanceof Node && this._ref.contains(target)) {
      ;(this._ref.querySelector('.dock-bar') as HTMLElement).focus()
    }
  }

  render(): React.ReactNode {
    const { dropFromPanel, draggingHeader } = this.state
    const { panelData, size } = this.props
    const { minWidth, minHeight, group, id, parent, panelLock } = panelData
    let styleName = group
    const tabGroup = this.context.getGroup(group)
    let { widthFlex, heightFlex } = tabGroup
    if (panelLock) {
      const { panelStyle, widthFlex: panelWidthFlex, heightFlex: panelHeightFlex } = panelLock
      if (panelStyle) {
        styleName = panelStyle
      }
      if (typeof panelWidthFlex === 'number') {
        widthFlex = panelWidthFlex
      }
      if (typeof panelHeightFlex === 'number') {
        heightFlex = panelHeightFlex
      }
    }
    let panelClass: string
    if (styleName) {
      panelClass = styleName
        .split(' ')
        .map(name => `dock-style-${name}`)
        .join(' ')
    }
    const isHBox = parent?.mode === 'horizontal'
    const isVBox = parent?.mode === 'vertical'

    const cls = `dock-panel ${panelClass ? panelClass : ''}${dropFromPanel ? ' dock-panel-dropping' : ''}${
      draggingHeader ? ' dragging' : ''
    }`
    let flex = 1
    if (isHBox && widthFlex != null) {
      flex = widthFlex
    } else if (isVBox && heightFlex != null) {
      flex = heightFlex
    }
    const flexGrow = flex * size
    let flexShrink = flex * 1000000
    if (flexShrink < 1) {
      flexShrink = 1
    }
    const style: React.CSSProperties = { minWidth, minHeight, flex: `${flexGrow} ${flexShrink} ${size}px` }
    let droppingLayer: React.ReactNode
    if (dropFromPanel) {
      const dropFromGroup = this.context.getGroup(dropFromPanel.group)
      const dockId = this.context.getDockId()
      if (!dropFromGroup.tabLocked || DragState.getData('tab', dockId) == null) {
        // not allowed locked tab to create new panel
        const DockDropClass = this.context.useEdgeDrop() ? DockDropEdge : DockDropLayer
        droppingLayer = <DockDropClass panelData={panelData} panelElement={this._ref} dropFromPanel={dropFromPanel} />
      }
    }

    return (
      <DragDropDiv
        getRef={this.getRef}
        className={cls}
        style={style}
        data-dockid={id}
        onDragOverT={this.onDragOver}
        onClick={this.onPanelClicked}
      >
        <DockTabs panelData={panelData} />
        {droppingLayer}
      </DragDropDiv>
    )
  }

  _unmounted = false

  componentWillUnmount(): void {
    if (DockPanel._droppingPanel === this) {
      DockPanel.droppingPanel = null
    }
    this._unmounted = true
  }
}
