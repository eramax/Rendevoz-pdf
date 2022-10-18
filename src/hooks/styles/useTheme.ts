import { GlobalScope } from '@/jotai/jotaiScope'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomFamily } from 'jotai/utils'

const defaultTheme = {
  primaryColor: 'rgb(162, 181, 200)',
  pa: 'asd'
}

const themeAtomFamily = atomFamily((key: keyof typeof defaultTheme) => atom(defaultTheme[key]))
type Theme = keyof typeof defaultTheme
type RemoveArrayRepeats<T extends readonly any[]> = {
  [K in keyof T]: T[number] extends { [P in keyof T]: P extends K ? never : T[P] }[number] ? never : T[K]
}
export function useTheme<T extends Theme[]>(...themes: RemoveArrayRepeats<T> & T) {
  const theme: Partial<typeof defaultTheme> = {}
  themes.map(key => {
    const value = useAtomValue(themeAtomFamily(key), GlobalScope)
    theme[key] = value
  })
  return theme
}

export const useSetTheme = (name: keyof typeof defaultTheme) => {
  const atom = themeAtomFamily(name)
  return useSetAtom(atom, GlobalScope)
}
