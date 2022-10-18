import { CustomEditor } from '@/components/editor/types'
import useDb from '@/hooks/stores/useDb'
import useLatest from '@/hooks/utils/useLatest'
import { GlobalScope } from '@/jotai/jotaiScope'
import { atom, useAtom } from 'jotai'
import { useMemo } from 'react'
import { INote } from '~/typings/data'
import BaseStore from './base.store'

const notesAtom = atom(new Map<number, INote>())
const useNoteStore = () => {
  const [notes, setNotes] = useAtom(notesAtom, GlobalScope)
  const latestNotes = useLatest(notes)
  const { add, get, orderedData, update } = BaseStore

  const all = orderedData(notes)
  const noteDb = useDb('notes')
  const blockDb = useDb('blocks')
  const getAllNotes = () => {
    return noteDb.toArray().then(data => setNotes(new Map(data.map(i => [i.id, i]))))
  }
  const addNote = (note: INote) => {
    const newNote: INote = {
      ...note,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    setNotes(add(newNote, notes))
    return noteDb.put(newNote)
  }
  const saveNote = (note: Partial<INote>) => {
    if (note.id) {
      return noteDb
        .get(note.id)
        .then(n => {
          return {
            ...n,
            ...note,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            allBlockIds: n?.allBlockIds || [],
            subBlockIds: n?.subBlockIds || []
          }
        })
        .then(n => {
          setNotes(add(n, notes))
          noteDb.put(n)
          return n
        })
    }
  }
  const updateNote = (note: Partial<INote>) => {
    return getNoteById(note.id)
      .then(n => ({
        ...n,
        ...note,
        updatedAt: Date.now()
      }))
      .then(n => {
        setNotes(update(n, notes))
        noteDb.put(n)
      })
  }
  const getNoteById = (noteId: number): Promise<INote> => {
    const notes = latestNotes.current
    const note = get(noteId, notes)
    if (note) {
      return Promise.resolve(note)
    }
    return new Promise((resolve, reject) => {
      noteDb.get(noteId).then(note => {
        if (note) {
          console.log('set')
          setNotes(add(note, notes))
          resolve(note)
        } else {
          reject('Where is the note? It is lost!')
        }
      })
    })
  }
  const getNotesByIds = (noteIds: number[]) => {
    return noteDb.bulkGet(noteIds)
  }
  const findParentNotes = (rootNoteId: number) => {
    const parentPath: INote[] = []
    const buildParentPath = (noteId: number, path: INote[]) => {
      return getNoteById(noteId).then(
        note => {
          path.unshift(note)
          if (note.parentNoteId) {
            buildParentPath(note.parentNoteId, path)
          }
        },
        rej => {
          return
        }
      )
    }
    return buildParentPath(rootNoteId, parentPath).then(() => parentPath)
  }
  const findSubNotes = (rootNoteId: number): Promise<INote[]> => {
    return new Promise(resolve => resolve(all.filter(i => i.parentNoteId === rootNoteId)))
  }
  const saveNoteAndBlocks = (editor: CustomEditor, blocks: [], title: string) => {
    const saveNoteItem = noteDb
      .get(blocks[0].noteId)
      .then(note => {
        if (note) {
          note.subBlockIds = editor.children.map(i => i.id)
          const newBlockIds = blocks.map(i => i.id)
          const deletedBlockIds = note.allBlockIds.filter(i => !newBlockIds.includes(i))
          note.allBlockIds = newBlockIds
          note.title = title
          blockDb.bulkDelete(deletedBlockIds)
        } else {
          note = {
            id: blocks[0].noteId,
            subBlockIds: editor.children.map(i => i.id) || [],
            allBlockIds: blocks.map(i => i.id) || [],
            title: title
          }
        }
        return note
      })
      .then(note => noteDb.put(note))
    const saveBlocks = blockDb.bulkPut(blocks)
    return Promise.all([saveBlocks, saveNoteItem])
  }
  const getNoteAndBlocks = (noteId: number) => {
    return noteDb.get(noteId).then(note => {
      return Promise.all([note, blockDb.bulkGet(note?.allBlockIds || [])])
    })
  }
  const search = () => {}

  return useMemo(
    () => ({
      all,
      getAllNotes,
      updateNote,
      findParentNotes,
      findSubNotes,
      addNote,
      saveNote,
      getNoteById,
      getNotesByIds,
      saveNoteAndBlocks,
      getNoteAndBlocks,
      search
    }),
    [notes]
  )
}

export default useNoteStore
