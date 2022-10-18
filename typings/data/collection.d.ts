import { IBase } from './base'

export interface ICollection extends IBase {
  name?: string
  description?: string
  documents?: number[]
  notes?: number[]
  items?: ICollectionItem[]
  parentId?: number | 0
}

export interface ICollectionItem {
  type?: 'note' | 'document',
  id?: number
}
