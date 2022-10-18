import { useState } from 'react'

export const useRefCallback = () => {
  // github use-callback-ref
  // https://stackoverflow.com/a/52334964
  const [ref] = useState(() => ({
    value: 1,
    callback: (newValue, lastValue) => { console.log(newValue, lastValue) },
    get current () {
      return ref.value
    },
    set current (value) {
      const last = ref.value
      ref.value = value
      ref.callback(value, last)
    }
  }))
  return ref;
}
