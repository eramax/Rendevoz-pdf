import React from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import { DockContext, DockContextType, PanelData, TabPaneCache } from './DockData'
import { TabPaneProps } from 'rc-tabs'
import { motion } from 'framer-motion'

interface DockTabPaneProps extends TabPaneProps {
  cacheId?: string
  cached: boolean
  parent?: PanelData
}
const variants = {
  hidden: {
    display: 'none',
    opacity: 0
  },
  visible: {
    opacity: 1
  }
}
export default class DockTabPane extends React.PureComponent<DockTabPaneProps, any> {
  static contextType = DockContextType

  context!: DockContext

  _ref: HTMLDivElement
  getRef = (r: HTMLDivElement) => {
    this._ref = r
  }

  updateCache() {
    const { cached, children, cacheId } = this.props
    if (this._cache) {
      if (!cached || cacheId !== this._cache.id) {
        this.context.removeTabCache(this._cache.id, this)
        this._cache = null
      }
    }
    if (cached && this._ref) {
      this._cache = this.context.getTabCache(cacheId, this)
      if (!this._ref.contains(this._cache.div)) {
        this._ref.appendChild(this._cache.div)
      }
      this.context.updateTabCache(this._cache.id, children)
    }
  }

  visited: boolean

  _cache: TabPaneCache

  handleClick = () => {
    const layout = this.context.getLayout()
    this.context.setLayout({
      ...layout,
      global: {
        ...layout.global,
        currentFocusedPanelId: this.props.parent?.id
      }
    })
  }
  render() {
    const { cacheId, cached, prefixCls, forceRender, className, style, id, active, animated, destroyInactiveTabPane, tabKey, children } =
      this.props
    if (active) {
      this.visited = true
    } else if (destroyInactiveTabPane) {
      this.visited = false
    }
    const mergedStyle: React.CSSProperties = {
      position: 'relative',
      width: '100%',
      height: 'calc( 100% - 42px )'
    }

    // when cached == undefined, it will still cache the children inside tabs component, but not across whole dock layout
    // when cached == false, children are destroyed when not active
    const isRender = cached === false ? active : this.visited

    let renderChildren: React.ReactNode = null
    if (cached) {
      renderChildren = null
    } else if (isRender || forceRender) {
      renderChildren = children
    }
    const getRef = cached ? this.getRef : null
    return (
      <motion.div
        ref={getRef}
        id={cacheId}
        initial={{ opacity: 0 }}
        animate={active ? 'visible' : 'hidden'}
        variants={variants}
        transition={{ duration: 0.5, type: 'tween' }}
        role="tabpanel"
        aria-labelledby={id && `${id}-tab-${tabKey}`}
        aria-hidden={!active}
        style={{ ...mergedStyle, ...style }}
      >
        {(active || this.visited || forceRender) && renderChildren}
      </motion.div>
    )
  }

  componentDidMount(): void {
    this.updateCache()
    this._ref.addEventListener('click', this.handleClick)
  }

  componentDidUpdate(prevProps: Readonly<DockTabPaneProps>, prevState: Readonly<any>, snapshot?: any): void {
    this.updateCache()
  }

  componentWillUnmount(): void {
    this._ref.removeEventListener('click', this.handleClick)
    if (this._cache) {
      this.context.removeTabCache(this._cache.id, this)
    }
  }
}
