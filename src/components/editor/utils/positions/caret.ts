export const getCaretGlobalPosition = () => {
  if(window.getSelection()?.rangeCount === 0){
    return
  }
  const r = window.getSelection()?.getRangeAt(0)
  const node = r?.startContainer
  const offset = r?.startOffset
  const scrollOffset = { x: window.scrollX, y: window.scrollY }
  let rect, r2
  if (offset > 0) {
    r2 = document.createRange()
    r2.setStart(node, offset - 1)
    r2.setEnd(node, offset)
    rect = r2.getBoundingClientRect()
    return { left: rect.right + scrollOffset.x, top: rect.bottom + scrollOffset.y }
  }else{
    r2 = document.createRange()
    r2.setStart(node,offset)
    r2.setEnd(node,offset)
    rect = r2.getBoundingClientRect()
    return {left: rect.right + scrollOffset.x,top: rect.bottom + scrollOffset.y}
  }
}
