export const getElementId = (element: Element | null): number | undefined => {
  if (!element) {
    return
  }
  const id = element.getAttribute('id')
  if (id) {
    return parseInt(id)
  }
}
