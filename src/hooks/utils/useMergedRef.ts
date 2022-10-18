import { MutableRefObject, Ref } from 'react'

export function assignRef<T = any>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === 'function') {
    ref(value)
  } else if (typeof ref === 'object' && ref !== null && 'current' in ref) {
    // eslint-disable-next-line no-param-reassign
    ref.current = value
  }
}
export function mergeRefs<T = any>(...refs: Ref<T>[]) {
  return (node: T | null) => {
    refs.forEach(ref => assignRef(ref, node))
  }
}

const useMergedRef = (...refs: MutableRefObject<any>[]) => {
  return (node: any | null) => {
    refs.forEach(ref => {
      if (typeof ref === 'function') {
        ref(node)
      } else if (typeof ref === 'object' && ref !== null && 'current' in ref) {
        ref.current = node
      }
    })
  }
}

export default useMergedRef
