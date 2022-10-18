import { atom, useAtom } from "jotai";

const canSubmitAtom = atom(false)

export const useCanSubmit = () => useAtom(canSubmitAtom)