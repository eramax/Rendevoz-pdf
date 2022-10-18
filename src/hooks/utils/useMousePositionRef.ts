/* eslint-disable semi */
import * as React from 'react'
import { RefObject, useEffect } from 'react'
import { useEvent } from 'react-use'
import useEventListener from './useEventListener'

/**
 * Mouse position as a tuple of [x, y]
 */
type MousePosition = [number, number]

/**
 * Hook to get the current mouse position
 * This hook doesn't trigger extra re-render
 *
 * @returns Mouse position as a tuple of [x, y]
 */

const useMousePosition = () => {
  const mousePosition = React.useRef<MousePosition>([0, 0])

  const updateMousePositionRef = React.useMemo(
    () => (ev: MouseEvent) => {
      mousePosition.current = [ev.pageX, ev.pageY]
    },
    []
  )

  useEventListener('mousemove', updateMousePositionRef)

  return mousePosition
}
export const useMousePositionWithRef = (ref: RefObject<Element>) => {
  const state = React.useRef({
    docX: 0,
    docY: 0,
    posX: 0,
    posY: 0,
    elX: 0,
    elY: 0,
    elH: 0,
    elW: 0
  })

  useEffect(() => {
    const moveHandler = (event: MouseEvent) => {
      if (ref && ref.current) {
        const { left, top, width: elW, height: elH } = ref.current.getBoundingClientRect()
        const posX = left + window.pageXOffset
        const posY = top + window.pageYOffset
        const elX = event.pageX - posX
        const elY = event.pageY - posY

        state.current = {
          docX: event.pageX,
          docY: event.pageY,
          posX,
          posY,
          elX,
          elY,
          elH,
          elW
        }
      }
    }
    document.addEventListener('mousemove', moveHandler)
    return () => {
      document.removeEventListener('mousemove', moveHandler)
    }
  }, [ref])

  return state
}

export default useMousePosition
