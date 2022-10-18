import { useEffect, useLayoutEffect, useRef } from 'react'

type EffectHookType = typeof useEffect | typeof useLayoutEffect

export const createUpdateEffect: (hook: EffectHookType) => EffectHookType = hook => (effect, deps) => {
  const isMounted = useRef(false)

  // for react-refresh
  hook(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  hook(() => {
    if (!isMounted.current) {
      isMounted.current = true
    } else {
      return effect()
    }
  }, deps)
}

const useUpdateEffect = createUpdateEffect(useEffect)

export default useUpdateEffect
