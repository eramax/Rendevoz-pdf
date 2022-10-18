export function scrollToTarget(target: HTMLElement | number, containerEl: HTMLElement) {
  // Moved up here for readability:
  const isElement = target && target.nodeType === 1,
    isNumber = Object.prototype.toString.call(target) === '[object Number]'

  if (isElement) {
    containerEl.scrollTop = target.offsetTop
  } else if (isNumber) {
    containerEl.scrollTop = target
  } else if (target === 'bottom') {
    containerEl.scrollTop = containerEl.scrollHeight - containerEl.offsetHeight
  } else if (target === 'top') {
    containerEl.scrollTop = 0
  }
}
