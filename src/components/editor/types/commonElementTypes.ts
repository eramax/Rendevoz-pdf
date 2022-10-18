import { Descendant } from 'slate'
import { CustomText, ElementWithId, EmptyText } from './baseTypes'

export interface HeadingElement {
  dest?: string | any[]
  id: number
  align?: string
  children: Descendant[]
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

export interface BlockQuoteElement {
  type: 'block-quote'
  align?: string
  children: Descendant[]
}
export interface EmojiElement {
  type: 'emoji'
  name: string
  children: EmptyText[]
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

export interface LinebreakElement {
  type: 'linebreak'
  children: EmptyText[]
}

export interface ImageElement {
  type: 'image'
  url: string
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
export interface OrderedListItemElement{

}

export interface UnorderedListItemElement{
  
}
export interface VideoElement {
  type: 'video'
  url: string
  children: EmptyText[]
}

export type CommonElement =
  | BlockQuoteElement
  | BulletedListElement
  | CheckListItemElement
  | EditableVoidElement
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
  | HeadingOneElement
  | HeadingTwoElement
  | HeadingThreeElement
  | EmojiElement