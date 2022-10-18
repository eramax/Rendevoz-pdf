import { Descendant } from 'slate'
import { EmptyText } from './baseTypes'

export interface HoleElement {
  type: 'hole'
  children: Descendant[]
}
export interface SpacerElement {
  type: 'spacer'
  children: EmptyText[]
}
