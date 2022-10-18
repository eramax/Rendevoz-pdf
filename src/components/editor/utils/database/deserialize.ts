export const deserializeEditor = (root, arr: []) => {
  const res = []
  const rootNodesId = root.subBlockIds
  const map = arr.reduce((res, v) => ((res[v.id] = v), res), {})
  for (const item of arr) {
    delete item.noteId
    delete item.plain
    if (!item.parentId) {
      const idx = rootNodesId.findIndex(i => i === item.id)
      if (idx >= 0) {
        res[idx] = item
      }

      continue
    }
    if (item.parentId in map) {
      const parent = map[item.parentId]
      parent.children = parent.children || []
      const subBlockIds = parent.subBlockIds
      const idx = subBlockIds.findIndex(i => i === item.id)
      if (idx >= 0) {
        parent.children[idx] = item
      }
    }
  }
  return res
}
