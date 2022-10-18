import { ipcInstance } from '@/plugins'
export const maximizeWindow = () => {
  ipcInstance.send('maximizeWindow')
}
export const minimizeWindow = () => {
  ipcInstance.send('minimizeWindow')
}
