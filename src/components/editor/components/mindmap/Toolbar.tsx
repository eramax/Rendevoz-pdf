import { Noop } from '@/common/types'
import { Toolbar } from '@/components/base'
import { FC } from 'react'
import styles from './index.module.less'

const MindmapToolbar: FC<{
  onZoomIn: Noop
  onZoomOut: Noop
  onFullScreen: Noop
  onOffScreen: Noop
  onAddNode: Noop
  onDelete: Noop
  onClose: Noop
}> = ({ onZoomIn, onZoomOut, onFullScreen, onOffScreen, onAddNode, onDelete, onClose }) => {
  return (
    <Toolbar itemClassName={styles.icon} direction="vertical">
      <Toolbar.Item iconName="park-zoom-in" onClick={onZoomIn} />
      <Toolbar.Item iconName="park-zoom-out" onClick={onZoomOut} />
      <Toolbar.Item iconName="park-full-screen" onClick={onFullScreen} />
      <Toolbar.Item iconName="park-off-screen" onClick={onOffScreen} />
      <Toolbar.Item iconName="park-plus" onClick={onAddNode} />
      <Toolbar.Item iconName="park-minus" onClick={onDelete} />
      <Toolbar.Item iconName="park-close" onClick={onClose} />
    </Toolbar>
  )
}

export default MindmapToolbar
