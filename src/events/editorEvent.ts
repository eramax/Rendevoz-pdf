import { Noop } from '@/common/types'
import { TabData } from '@/components/base/dock'
import { CustomElement } from '@/components/editor/customTypes'
import { Event } from './eventEmitter'
import EventHandler from './eventHandler'

export interface FoldHeadingEvent {
  headingId: number
  folded: boolean
}
export interface InsertNodeEvent {
  element: CustomElement
}
export interface SwitchTabEvent {
  tabId?: string
  noteId?: number
}
export interface ElementPropertyChangeEvent {
  element: CustomElement
}
export interface IndicatorChangeEvent {
  direction?: string
  id?: number
}
export interface ToggleOverlayEvent {
  top?: number
  left?: number
  content?: string
}
export interface TabDataChangeEvent {
  id: string
  noteId?: number
  tab: Partial<TabData>
}
export interface InsertTabEvent {
  id?: string
  panelId?: string
  noteId?: number
  parentNoteId?: number
  autoFocus?: boolean
  isNew?: boolean
}
export interface DeleteSubPageEvent {
  subPageNoteId: number
}
export type OuterElementPropertyChangeEvent = ElementPropertyChangeEvent
export type DeletePanelEvent = {
  panelId: string
}
export interface EditorEventMap {
  insertNode: InsertNodeEvent
  foldHeading: FoldHeadingEvent
  toggleThoughtLayer: Noop
  toggleOverlay: ToggleOverlayEvent
  openMenu: Noop
  compositionStart: Noop
  compositionEnd: Noop
  forceUpdate: Noop
  indicatorChange: IndicatorChangeEvent
  switchTab: SwitchTabEvent
  insertTab: InsertTabEvent
  elementPropertyChange: ElementPropertyChangeEvent
  outerElementPropertyChange: OuterElementPropertyChangeEvent
  tabDataChange: TabDataChangeEvent
  deleteSubPage: DeleteSubPageEvent
  deletePanel: DeletePanelEvent
}
export type EditorEvent = Event<EditorEventMap, keyof EditorEventMap>
export class EditorEventHandler extends EventHandler<EditorEventMap> {}
