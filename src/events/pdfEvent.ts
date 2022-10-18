import { Noop } from '@/common/types'
import { HighlightArea } from '~/typings/data'
import { Event } from './eventEmitter'
import EventHandler from './eventHandler'

interface JumpToHighlightEvent {
  area: HighlightArea
}
interface JumpToDestEvent {
  dest: string
}
interface AddThoughtEvent {
  id: number
}
interface JumpToPageEvent {
  pageIndex: number
}
export interface TextSelectRect {
  left?: number
  top?: number
  width?: number
  height?: number
  percentageLeft?: number
  percentageTop?: number
  percentageWidth?: number
  percentageHeight?: number
}
export interface TextSelectEvent {
  selectedText?: string
  pageIndex: number
  rects?: TextSelectRect[]
  isCancel: boolean
}

export interface PdfEventMap {
  jumpToHighlight: JumpToHighlightEvent
  jumpToDest: JumpToDestEvent
  addThought: AddThoughtEvent
  jumpToPage: JumpToPageEvent
  textSelect: TextSelectEvent
  addHighlight: Noop
  cancelTextSelect: Noop
  zoomIn: Noop
  zoomOut: Noop
  autoFit: Noop
  togglePan: Noop
}
export type PdfEvent = Event<PdfEventMap, keyof PdfEventMap>

export class PdfEventHandler extends EventHandler<PdfEventMap> {}
