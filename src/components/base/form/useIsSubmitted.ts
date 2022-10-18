import { atom, useAtom } from 'jotai'

const isSubmittedAtom = atom(false)

export const useIsSubmitted = () => useAtom(isSubmittedAtom)
