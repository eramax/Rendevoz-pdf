import { TextSelectRect } from '@/events/pdfEvent'
import { EditorDestination } from './note'

export interface ILabel {
  id?: number
  title?: string
  content?: string
  documentId?: number
  background?: string
  type?: string
  color?: string
  createTime?: number
  modifyTime?: number
}
export interface IDroppableLabel extends ILabel {
  page?: number
  rect?: number[]
  mode?: 'icon' | 'picture'
  icon?: string
  pictrue?: string
}

export interface IHighlightLabel extends ILabel {
  selectedText?: string
  page?: number
  rects?: TextSelectRect[]
}
export interface IThoughtLabel extends IDroppableLabel {
  // noteId - noteDestinations[]
  position?: 'left' | 'top' | 'right' | 'bottom'
  targetNotesDesitinations: Map<number, EditorDestination[]>
}
