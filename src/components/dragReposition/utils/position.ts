import { MouseEvent } from "react"

const determineDirection = () => {}

export const getDistanceBetweenPointAndElement = (e: MouseEvent, element: Element) => {
  const { clientX: pointX, clientY: pointY } = e
  const rect = element.getBoundingClientRect()
  const { top, left, width, height } = rect
  return {
    top: pointY - top,
    left: pointX - left,
    right: left + width - pointX,
    bottom: top + height - pointY
  }
}
