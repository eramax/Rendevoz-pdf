import { useEditorVisible } from '@/components/editor/hooks/useEditorVisible'
import { FC } from 'react'

interface ToolbarProps {
  onZoomInClick?: () => void
  onZoomOutClick?: () => void
  onSwitchWatchModeClick?: () => void
  onOpenEditorClick?: () => void
  onOpenTranslateClick?: () => void
  onExtractOutline?: () => void
}
export const Toolbar: FC<ToolbarProps> = props => {
  const [editorVisible, setEditorVisible] = useEditorVisible()
  return (
    <div>
      <button onClick={props?.onOpenEditorClick}>open editor</button>
      {editorVisible && <button>insert text selection</button>}
      <button onClick={props?.onZoomInClick}>zoom in</button>
      <button onClick={props?.onZoomOutClick}>zoom out</button>
      <button onClick={props?.onOpenTranslateClick}>translate box</button>
      <button onClick={props.onExtractOutline}>extract outline</button>
    </div>
  )
}
