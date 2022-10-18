import { createContext, useContext } from 'react'

export interface ContextMenuContext {
  docX: number
  docY: number
  eleX: number
  eleY: number
  relX: number
  relY: number
}

const ContextMenuContext = createContext<ContextMenuContext | null>(null)
export const ContextMenuProvider = ContextMenuContext.Provider

export const useContextMenu = () => {
  const value = useContext(ContextMenuContext)
  if (value === null) {
    throw new Error('Not used in Context Menu')
  }
  return value
}
