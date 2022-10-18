// algorithm based on interpolation search
// only search twice for 500 nodes
export const searchBlock = (entries: [globalThis.Element, { height: number; top: number }][], distance: number) => {
  let left = 0
  let right = entries.length - 1
  let index = -1
  let searchCount = 0
  const isIn = ({ height, top }) => {
    if (distance > top && distance < height + top) {
      return true
    }
    return false
  }
  while (left <= right) {
    searchCount += 1
    // prevent dead loop
    if (searchCount > 1000) break
    const rangeDelta = entries[right][1].height + entries[right][1].top - entries[left][1].top
    const indexDelta = right - left
    const valueDelta = distance - entries[left][1].top
    if (valueDelta < 0) {
      index = -1
      break
    }
    if (!rangeDelta) {
      const entry = entries[left][1]
      index = isIn(entry) ? left : -1
      break
    }
    const middleIndex = left + Math.floor((valueDelta * indexDelta) / rangeDelta)
    if (!entries[middleIndex]) {
      return -1
    }
    if (isIn(entries[middleIndex][1])) {
      index = middleIndex
      break
    }
    if (entries[middleIndex][1].top + entries[middleIndex][1].height <= distance) {
      left = middleIndex + 1
    } else {
      right = middleIndex - 1
    }
  }
  if (index !== -1) {
    return entries[index][0]
  }
  return -1
}
