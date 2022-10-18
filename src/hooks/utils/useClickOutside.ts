import { MutableRefObject, useEffect } from 'react'

const useClickOutside = (callback: () => void, ref: MutableRefObject<unknown> | MutableRefObject<unknown>[]) => {
  const targets = Array.isArray(ref) ? ref : [ref]
  const handleClick = e => {
    if (targets.some(i => i.current && !i.current.contains(e.target))) {
      callback()
    }
  }
  useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  })
}
export default useClickOutside
