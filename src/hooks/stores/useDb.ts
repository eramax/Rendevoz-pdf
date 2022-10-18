import { db } from '@/utils/db'

const useDb = (table: string) => {
  return db.table(table)
}
export default useDb
