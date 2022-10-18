import { useState, useEffect } from 'react'
import useDebounceFn from './useDebounceFn'

function useDebounce<T>(value: T, options?: { wait?: number; leading?: boolean; trailing?: boolean; maxWait?: number }) {
  const [debounced, setDebounced] = useState(value)

  const { run } = useDebounceFn(() => {
    setDebounced(value)
  }, options)

  useEffect(() => {
    run()
  }, [value])

  return debounced
}

export default useDebounce
