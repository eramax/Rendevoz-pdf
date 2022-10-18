import { useCallback, useState } from 'react'

function useCallbackRef() {
  const [ref, setRef] = useState(null)
  const fn = useCallback(node => {
    setRef(node)
  }, [])
  return [ref, fn]
}

export default useCallbackRef
