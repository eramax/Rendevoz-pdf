import { Noop } from '@/common/types'
import { Content } from '../base'
import Menu from '../base/menu'
import Icon from '../base/Icon'

const PdfViewerToolMenu = ({
  onZoomIn,
  onZoomOut,
  onAutoFit,
  onPan,
  onSearch,
  onClean,
}: {
  onZoomIn?: Noop
  onZoomOut?: Noop
  onAutoFit?: Noop
  onSearch?: Noop
  onPan?: Noop
  onClean?: Noop
}) => {
  return (
    <Menu>
      <Menu.Item type="button" onClick={onZoomIn}>
        <Content flex alignItems="center" gap={10}>
          <Icon name="park-zoom-in"></Icon>
          <span>Zoom in</span>
        </Content>
      </Menu.Item>
      <Menu.Item type="button" onClick={onZoomOut}>
        <Content flex alignItems="center" gap={10}>
          <Icon name="park-zoom-out"></Icon>
          <span>Zoom out</span>
        </Content>
      </Menu.Item>
      <Menu.Item type="button" onClick={onAutoFit}>
        <Content flex alignItems="center" gap={10}>
          <Icon name="park-auto-width"></Icon>
          <span>Auto fit width</span>
        </Content>
      </Menu.Item>
      <Menu.Item type="button" onClick={onPan}>
        <Content flex alignItems="center" gap={10}>
          <Icon name="park-move"></Icon>
          <span>Pan mode</span>
        </Content>
      </Menu.Item>
      <Menu.Item type="button" onClick={onClean}>
        <Content flex alignItems="center" gap={10}>
          <Icon name="park-preview-close"></Icon>
          <span>Clean mode</span>
        </Content>
      </Menu.Item>
      <Menu.Item type="button" onClick={onSearch}>
        <Content flex alignItems="center" gap={10}>
          <Icon name="park-search"></Icon>
          <span>Search</span>
        </Content>
      </Menu.Item>
    </Menu>
  )
}

export default PdfViewerToolMenu
