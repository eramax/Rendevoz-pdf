import _ from 'lodash'
import { useEffect, useMemo, useRef } from 'react'
import useLatest from './useLatest'

type noop = (...args: any) => any
function useThrottleFn<T extends noop>(fn: T, options) {
  const fnRef = useLatest(fn)
  const wait = options?.wait ?? 1000
  const throttled = useMemo(
    () =>
      _.throttle(
        (...args: Parameters<T>): ReturnType<T> => {
          return fnRef.current(...args)
        },
        wait,
        options
      ),
    []
  )
  useEffect(
    () => () => {
      throttled.cancel()
    },
    []
  )
  return {
    run: throttled,
    cancel: throttled.cancel,
    flush: throttled.flush
  }
}
export default useThrottleFn
