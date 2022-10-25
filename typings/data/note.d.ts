import { IBase } from './base'

export interface INote extends IBase {
  allBlockIds: number[]
  subBlockIds: number[]
  parentNoteId?: number
  title: string
}

export interface NoteBlock {
  noteId: number
  parentBlockId?: number
  version: number
  subBlockIds?: number[]
}

export interface Keyword {
  word: string
  description: string
}