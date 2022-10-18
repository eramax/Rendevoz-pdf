import { useRef } from "react"
import useLatest from "./useLatest"

const useRafFn = (fn: (...args) => void) => {
  const fnRef = useLatest(fn)
  const frameIdRef = useRef(null)
  let lastArgs

  const later = context => () => {
    frameIdRef.current = null
    const lfn = fnRef.current
    lfn.apply(context, lastArgs)
  }
  const throttled = function (...args) {
    lastArgs = args
    if (frameIdRef.current === null) {
      frameIdRef.current = requestAnimationFrame(later(this))
    }
  }
  throttled.cancel = () => {
    cancelAnimationFrame(frameIdRef.current)
    frameIdRef.current = null
  }
  return throttled
}

export default useRafFn
