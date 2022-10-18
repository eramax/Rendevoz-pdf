import { useEffect, useState } from 'react'
import Content from './Content'
import { motion } from 'framer-motion'
import Icon from './Icon'
import { useMeasure } from 'react-use'
import useToggle from '@/hooks/utils/useToggle'

interface PanelProps {
  title: string | React.ReactNode
  children: React.ReactNode
  style?: React.CSSProperties
  defaultVisible?: boolean
}
const variants = {
  open: {
    opacity: 1,
    height: 'auto'
  },
  hide: {
    opacity: 0,
    height: 0
  }
}
const Panel: React.FC<PanelProps> = ({ title, children, style, defaultVisible = true }) => {
  const [hide, toggle] = useToggle(!defaultVisible)
  const [duration, setDuration] = useState(0.3)
  const [ref, { height }] = useMeasure()
  useEffect(() => {
    setDuration(getAutoHeightDuration(height) / 1000)
  }, [height])
  return (
    <Content fullWidth flex column style={style}>
      <Content flex alignItems="center" justifyContent="space-between">
        <div style={{ cursor: 'pointer' }} onClick={() => toggle()}>
          {title}
        </div>
        <Icon cursor="pointer" name={hide ? 'park-down' : 'park-up'} onClick={() => toggle()} />
      </Content>
      <motion.div
        inherit={false}
        style={{ overflow: 'hidden' }}
        initial={hide ? 'hide' : 'open'}
        animate={hide ? 'hide' : 'open'}
        variants={variants}
        transition={{ ease: 'easeOut', duration: duration }}
      >
        <div ref={ref}>{children}</div>
      </motion.div>
    </Content>
  )
}
function getAutoHeightDuration(height: number) {
  if (!height) {
    return 0
  }
  const constant = height / 36
  const duration = Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10)
  return duration
}
export default Panel
