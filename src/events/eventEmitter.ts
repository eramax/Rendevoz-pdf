import { EditorEvent } from '@/events/editorEvent'
import Id from '@/utils/id'
import { atom } from 'jotai'
import EventHandler from './eventHandler'
import { PdfEvent } from './pdfEvent'

export interface Event<T, K extends keyof T> {
  readonly type: K
  readonly data?: T[K]
}
export interface EventMap {
  editor: EditorEvent
  pdf: PdfEvent
}
export default class EventEmitter {
  private listeners: { [name: string]: Array<EventHandler<unknown>> } = {}
  private ackEvents: { name: string; data: any }[] = []
  public addListener<K extends keyof EventMap>(name: K, handler: EventHandler<unknown>) {
    if (!this.listeners[name]) {
      this.listeners[name] = []
    }

    this.listeners[name].push(handler)
  }

  public removeListener<K extends keyof EventMap>(name: K, handler: EventHandler<unknown>) {
    this.listeners[name] = this.listeners[name]?.filter(h => h !== handler)
  }

  public removeAllListeners<K extends keyof EventMap>(name: K) {
    this.listeners[name] = []
  }

  public emit<K extends keyof EventMap>(name: K, data?: EventMap[K] | { eventId: number }, ack = false) {
    data = {
      ...data,
      eventId: Id.getId()
    }
    this.listeners[name]?.forEach(handler => {
      handler.handle(data)
    })
    // do we really need this?
    if (ack) {
      this.ackEvents.push({
        name,
        data
      })
    }
  }

  public getAckEvents() {
    return this.ackEvents
  }

  public removeAck(eventId: number) {
    this.ackEvents = this.ackEvents.filter(i => i.data.eventId !== eventId)
  }
}

export const eventEmitter = atom(new EventEmitter())
