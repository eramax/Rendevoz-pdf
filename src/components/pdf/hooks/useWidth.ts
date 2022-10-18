import { atom, useAtom } from 'jotai'

const widthAtom = atom({
  viewerWidth: '60%',
  sidebarWidth: '40%'
})

const useWidth = () => useAtom(widthAtom)

export default useWidth
