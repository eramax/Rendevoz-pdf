import { useEffect } from 'react'
import useNoteStore from './stores/note.store'

const Initializer = () => {
  const { getAllNotes } = useNoteStore()
  useEffect(() => {
    getAllNotes()
  }, [])
  return null
}

export default Initializer
