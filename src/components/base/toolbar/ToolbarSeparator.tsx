import { CSSProperties, FC } from 'react'

interface ToolbarSeparatorProps {
  direction?: 'vertical' | 'horizontal'
}

const ToolbarSeparator: FC<ToolbarSeparatorProps> = ({ direction }) => {
  const verticalSeparator: CSSProperties = {
    width: '1px',
    height: '60%',
    margin: '0px 6px',
    background: '#d9d9d9'
  }
  const horizontalSeparator: CSSProperties = {
    borderRight: '1px solid #CCC'
  }
  return <div style={direction === 'horizontal' ? verticalSeparator : horizontalSeparator}></div>
}

export default ToolbarSeparator
