import { GlobalScope } from '@/jotai/jotaiScope'
import useDb from '@/hooks/stores/useDb'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { splitAtom } from 'jotai/utils'
import { useMemo } from 'react'
import { ITask } from '~/typings/data'

const tasksAtom = atom<ITask[]>([])
const taskAtomsAtom = splitAtom(tasksAtom)

const useTaskStore = () => {
  const database = useDb('tasks')
  const dispatch = useSetAtom(taskAtomsAtom, GlobalScope)

  const fetchAll = async () => {}
  const getTaskById = () => {}
  const getTasksByOriginId = (originId: number) => {
    const filteredTaskAtomsAtom = useMemo(() => atom(get => get(taskAtomsAtom).filter(i => get(i).originId === originId)), [])
    const atoms = useAtomValue(filteredTaskAtomsAtom)
    return atoms
  }
  return {
    getTasksByOriginId
  }
}
