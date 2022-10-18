import { useEffect, useState } from 'react'
import useCallbackRef from './useCallbackRef'
import ResizeObserver from 'resize-observer-polyfill'
const useMeasure = (ref: React.RefObject<unknown>) => {
  const [element, attachRef] = useCallbackRef()
  const [bounds, setBounds] = useState({})
  function onResize([entry]) {
    setBounds({
      height: entry.contentRect.height
    })
  }
  useEffect(() => {
    const observer = new ResizeObserver(onResize)
    if (element && element.current) {
      observer.observe(element.current)
    }
    return () => {
      observer.disconnect()
    }
  }, [element])
  useEffect(() => {
    attachRef(ref)
  }, [attachRef, ref])
  return bounds
}

export default useMeasure
