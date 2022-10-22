import useDb from '@/hooks/stores/useDb'
import { useMemo } from 'react'

const useBlockStore = () => {
  const db = useDb('blocks')
  const getBlockById = (id: number) => {
    return db.get(id)
  }
  const getBlocksByIds = (ids: number[]) => {
    return db.bulkGet(ids)
  }

  return useMemo(
    () => ({
      getBlockById,
      getBlocksByIds
    }),
    []
  )
}

export default useBlockStore
