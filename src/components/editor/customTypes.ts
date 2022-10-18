import { Descendant, BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'
import { ITextSelectionLabel } from '@/../typings/data'

export interface ElementWithId {
  id: number
}
export interface OuterElement extends ElementWithId {
  originId: number
}
export interface BlockQuoteElement {
  type: 'block-quote'
  align?: string
  children: Descendant[]
}

export interface BulletedListElement {
  type: 'bulleted-list'
  align?: string
  children: Descendant[]
}

export interface CheckListItemElement {
  type: 'check-list-item'
  checked: boolean
  children: Descendant[]
}

export interface EditableVoidElement {
  type: 'editable-void'
  children: EmptyText[]
}

export interface HeadingElement {
  dest?: string | any[]
  id: number
  align?: string
  children: Descendant[]
}
export interface LinebreakElement {
  type: 'linebreak'
  children: EmptyText[]
}
export interface HeadingOneElement extends HeadingElement {
  type: 'heading-one'
}
export interface HeadingTwoElement extends HeadingElement {
  type: 'heading-two'
}
export interface HeadingThreeElement extends HeadingElement {
  type: 'heading-three'
}
export interface ImageElement {
  type: 'image'
  url: string
  children: EmptyText[]
}
export interface ThoughtElement extends OuterElement {
  type: 'thought'
  title: string
  content: string
  children: EmptyText[]
}
export interface HighlighElement extends OuterElement {
  type: 'highlight'
  selectedText?: string
  title?: string
  content?: string
  children: EmptyText[]
}
export interface LinkElement {
  type: 'link'
  url: string
  children: Descendant[]
}

export interface ButtonElement {
  type: 'button'
  children: Descendant[]
}

export interface ListItemElement {
  type: 'list-item'
  children: Descendant[]
}

export interface MentionElement {
  type: 'mention'
  character: string
  children: CustomText[]
}

export interface ParagraphElement {
  type: 'paragraph'
  align?: string
  children: Descendant[]
}

export interface TableElement {
  type: 'table'
  children: TableRow[]
}

export interface TableCellElement {
  type: 'table-cell'
  children: CustomText[]
}

export interface TableRowElement {
  type: 'table-row'
  children: TableCell[]
}

export interface TitleElement {
  type: 'title'
  children: Descendant[]
}

export interface VideoElement {
  type: 'video'
  url: string
  children: EmptyText[]
}

export interface TextSelectionCardElement {
  type: 'textSelectionCard'
  label: ITextSelectionLabel
  children: Descendant[]
}
export interface HoleElement {
  type: 'hole'
  children: Descendant[]
}
export interface SpacerElement {
  type: 'spacer'
  children: Descendant[]
}

export type CustomElement =
  | BlockQuoteElement
  | BulletedListElement
  | CheckListItemElement
  | EditableVoidElement
  | HeadingOneElement
  | HeadingTwoElement
  | HeadingThreeElement
  | ImageElement
  | LinkElement
  | ButtonElement
  | ListItemElement
  | MentionElement
  | ParagraphElement
  | TableElement
  | TableRowElement
  | TableCellElement
  | TitleElement
  | VideoElement
  | LinebreakElement
  | TextSelectionCardElement
  | SpacerElement
  | HoleElement
  | ThoughtElement
  | HighlighElement

export interface CustomText {
  bold?: boolean
  italic?: boolean
  code?: boolean
  text: string
}

export interface EmptyText {
  text: string
}

export type CustomEditor = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    fontSize: string
  }
