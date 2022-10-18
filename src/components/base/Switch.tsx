import { useSetTheme, useTheme, useToggle } from '@/hooks'
import { CSSProperties, FC } from 'react'
import { motion } from 'framer-motion'

interface SwitchProps {
  onChange?: (value: boolean) => void
  defaultValue?: boolean
  width?: number
  height?: number
}
const spring = {
  type: 'spring',
  stiffness: 700,
  damping: 30
}
const Switch: FC<SwitchProps> = ({ onChange, defaultValue = false }) => {
  const [on, toggleOn] = useToggle(defaultValue)
  const { primaryColor } = useTheme('primaryColor')
  const switchStyle: CSSProperties = {
    width: 44,
    flexShrink: 0,
    height: 22,
    backgroundColor: on ? primaryColor : '#00000040',
    display: 'flex',
    justifyContent: on ? 'flex-end' : 'flex-start',
    borderRadius: 999,
    padding: 2,
    cursor: 'pointer',
    transition: 'background 0.3s ease',
    position: 'relative'
  }
  const handleStyle: CSSProperties = {
    width: 18,
    height: 18,
    backgroundColor: 'white',
    borderRadius: 999
  }
  return (
    <div
      onClick={() => {
        toggleOn()
        onChange?.(!on)
      }}
      style={switchStyle}
    >
      <motion.div style={handleStyle} layout transition={spring}></motion.div>
    </div>
  )
}

export default Switch
