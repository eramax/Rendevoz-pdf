const ZoomLevels = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.3, 1.5, 1.7, 1.9, 2.1, 2.4, 2.7, 3.0, 3.3, 3.7, 4]

export const increaseLevel = (current: number) => ZoomLevels.find(i => i > current) || current

export const decreaseLevel = (current: number) => {
  const idx = ZoomLevels.findIndex(i => i >= current)
  return idx <= 0 ? current : ZoomLevels[idx - 1]
}
