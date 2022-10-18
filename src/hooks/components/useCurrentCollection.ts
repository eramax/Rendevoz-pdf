import { GlobalScope } from '@/jotai/jotaiScope'
import { atom, useAtom } from 'jotai'
import { ICollection } from '~/typings/data'

const currentCollection = atom<ICollection | null>(null)

const useCurrentCollection = () => useAtom(currentCollection, GlobalScope)


export default useCurrentCollection
