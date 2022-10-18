import { Coordinates } from "./types"

export const calculatePointerCollide = (pointer: Coordinates, objectCoord: Coordinates, tolerance = 0) => {
  if (
    pointer.top > objectCoord.top &&
    pointer.top < objectCoord.top + objectCoord.height &&
    pointer.left > objectCoord.left &&
    pointer.left < objectCoord.left + objectCoord.width
  ) {
    if ((pointer.left - objectCoord.left) / objectCoord.width < 0.1) {
      return 'left'
    }
    if ((objectCoord.left + objectCoord.width - pointer.left) / objectCoord.width < 0.1) {
      return 'right'
    }
    if ((pointer.top - objectCoord.top) / objectCoord.height < 0.5) {
      return 'top'
    }
    return 'bottom'
  }
  return false
}
