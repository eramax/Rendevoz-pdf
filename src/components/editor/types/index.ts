import EventEmitter from '@/events/eventEmitter'
import { BaseEditor } from 'slate'
import { HistoryEditor } from 'slate-history'
import { ReactEditor } from 'slate-react'
import { CustomText, EmptyText } from './baseTypes'
import { CommonElement } from './commonElementTypes'
import { OuterElement } from './outerElementTypes'

export type CustomEditor = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    emitter?: EventEmitter
  }

export type CustomElement = CommonElement | OuterElement

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement & { hide: boolean; id: number }
    Text: CustomText | EmptyText
  }
}

export type { OuterElement, CommonElement }
