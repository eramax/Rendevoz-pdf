import { createContext, useContext } from 'react'
import { ICollection, IPdfDocument } from '~/typings/data'

export const CurrentSelectContext = createContext<ICollection | IPdfDocument | null | undefined>(null)

export const useCurrentSelect = () => {
  const ctx = useContext(CurrentSelectContext)
  return ctx
}
