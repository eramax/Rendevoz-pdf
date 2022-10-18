import usePrevious from '@/hooks/utils/usePrevious'
import { FC, useEffect, useState } from 'react'

interface Props {
  children?: React.ReactNode
  scrollDirection?: 'down' | 'up'
  scrolled?: boolean
  height?: number
  upper: React.ReactNode
  lower: React.ReactNode
  wrapperStyle: React.CSSProperties
  wrapperClassName?: string
}

const ScrollableHeader: FC<Props> = ({ scrollDirection = 'down', scrolled = false, wrapperStyle = { height: 50 }, ...rest }) => {
  const previousScrolled = usePrevious(scrolled)
  const [currentScroll, setCurrentScroll] = useState(false)
  useEffect(() => {
    if (scrolled && !previousScrolled) {
      setCurrentScroll(true)
    }
    if (!scrolled && previousScrolled) {
      setCurrentScroll(false)
    }
  }, [previousScrolled, setCurrentScroll, scrolled])
  const scrollStyle: React.CSSProperties = currentScroll
    ? {
        transform: scrollDirection === 'down' ? `translateY(-${wrapperStyle.height})` : `translateY(${wrapperStyle.height})`,
        transition: 'transform .3s cubic-bezier(.645,.045,.355,1)'
      }
    : {
        transform: 'translateY(0)',
        transition: 'transform .3s cubic-bezier(.645,.045,.355,1)'
      }
  return (
    <>
      <div className={rest.wrapperClassName} style={{ overflow: 'hidden', ...wrapperStyle }}>
        <div style={{ height: wrapperStyle.height, width: '100%', ...scrollStyle }}>{rest.upper}</div>
        <div style={{ height: wrapperStyle.height, width: '100%', ...scrollStyle }}>{rest.lower}</div>
      </div>
    </>
  )
}
export default ScrollableHeader
