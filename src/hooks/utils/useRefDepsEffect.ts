import { useRef, useEffect, RefObject, EffectCallback, DependencyList } from 'react'

export const useRefDepsEffect = createRefDepsHook(useEffect)

type UseEffectLike = (effect: EffectCallback, deps?: DependencyList) => void

export function createRefDepsHook (useEffectLike: UseEffectLike) {
  return (effect: EffectCallback, refDeps: DependencyList) => {
    const cleanupRef = useRef<(() => void) | undefined>()
    const prevDepsRef = useRef<DependencyList>()

    useEffectLike(() => {
      const prevDeps = prevDepsRef.current
      if (prevDeps && refDeps.every((v, i) => Object.is(isRefObj(v) ? v.current : v, prevDeps[i]))) {
        return
      }

      cleanupRef.current?.()
      cleanupRef.current = effect()!
      prevDepsRef.current = refDeps.map(v => (isRefObj(v) ? v.current : v))
    })

    useEffectLike(() => () => cleanupRef.current?.(), [])
  }
}

function isRefObj (ref: any): ref is RefObject<any> {
  return (ref !== null || ref !== undefined) && 'current' in ref
}
