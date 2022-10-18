import { Descendant } from 'slate'
import { ElementWithId, EmptyText } from './baseTypes'

export interface IOuterElement extends ElementWithId {
  /**
   * Origin id represents the id which the outer element has in its original place
   * For example: The id highlight has in pdf note
   */
  originId: number
}

export interface ThoughtElement extends IOuterElement {
  type: 'thought'
  title: string
  content: string
  children: EmptyText[]
}

export interface HighlighElement extends IOuterElement {
  type: 'highlight'
  selectedText: string
  title: string
  content: string
  children: EmptyText[]
}
export interface SubPageElement extends IOuterElement {
  type: 'subPage'
  iconName?: string
}
export type OuterElement = ThoughtElement | HighlighElement | SubPageElement
