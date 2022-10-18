export function addEvent (el: Node | null | undefined, event: string, handler: EventListenerOrEventListenerObject | null, inputOptions?: Object): void {
  if (!el) return
  const options = { capture: true, ...inputOptions }
  el!.addEventListener(event, handler, options)
}
export function removeEvent (el: Node | null | undefined, event: string, handler: EventListenerOrEventListenerObject | null, inputOptions?: Object): void {
  if (!el) return
  const options = { capture: true, ...inputOptions }
  el!.removeEventListener(event, handler, options)
}
