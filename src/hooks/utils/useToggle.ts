import { Reducer, useReducer } from 'react'

const toggleReducer = (state: boolean, nextValue?: unknown) => (typeof nextValue === 'boolean' ? nextValue : !state)
const useToggle = (initialValue: boolean): [boolean, (nextValue?: unknown) => void] => {
  return useReducer<Reducer<boolean, unknown>>(toggleReducer, initialValue)
}

export default useToggle
