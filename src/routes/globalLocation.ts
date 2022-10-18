import { createContext, useContext } from 'react'
import { Location } from 'react-router-dom'

// react router v6 v6.4.0 make location contextual,so we need a global location context,or we can't get correct location in Home component
export const GlobalLocationContext = createContext<Location | null>(null)

export const GlobalLocationContextProvider = GlobalLocationContext.Provider

export const useGlobalLocation = () => useContext(GlobalLocationContext)
