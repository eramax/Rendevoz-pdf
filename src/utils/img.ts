import { ipcInstance } from '@/plugins'
export const saveImageLocally = (imgName: string, imgData: string) => {
  return ipcInstance.send('saveImage', imgName, imgData)
}
