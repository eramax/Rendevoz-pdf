import { GlobalScope } from '@/jotai/jotaiScope'
import { atom, useAtomValue } from 'jotai'
import React from 'react'
import { MutableRefObject } from 'react'
import { IEditorRef } from '../Editor'

const selectedEditorRefAtom = atom<MutableRefObject<IEditorRef | null>>(React.createRef<IEditorRef>())

export const useSelectedEditorRef = () => useAtomValue(selectedEditorRefAtom, GlobalScope)
