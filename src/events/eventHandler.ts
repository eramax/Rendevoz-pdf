
class EventHandler<T> {
  private readonly handlerMap = new Map()

  on<K extends keyof T>(type: K, handler: (data: T[K]) => void) {
    this.handlerMap.set(type, handler)
  }
  handle(event) {
    const handler = this.handlerMap.get(event.type)
    if (handler) {
      handler(event.data)
    }
  }
}

export default EventHandler
