import { ipcInstance } from '@/plugins'
import { maximizeWindow, minimizeWindow } from '@/utils/window'
import { useEffect, useState } from 'react'
import { Content } from '../base'
import Icon from '../base/Icon'
import styles from './index.module.less'

const TitleBar = () => {
  const [isFullScreen, setIsFullScreen] = useState(false)
  useEffect(() => {
    ipcInstance.on('winUnmaximized', () => {
      setIsFullScreen(false)
    })
    ipcInstance.on('winMaximized', () => {
      setIsFullScreen(true)
    })
    return () => {
      ipcInstance.off('winMaximized')
      ipcInstance.off('winUnmaximized')
    }
  }, [])
  return (
    <Content fullWidth flex alignItems="center" justifyContent="flex-end" gap={10} className={styles.titleBar}>
      <Icon
        className={styles.icon}
        name="park-minus"
        fill="#8590ae"
        cursor="pointer"
        onClick={() => {
          minimizeWindow()
          console.log('asdsadas')
        }}
      />
      <Icon
        className={styles.icon}
        name={isFullScreen ? 'park-off-screen' : 'park-full-screen'}
        fill="#8590ae"
        cursor="pointer"
        onClick={() => {
          maximizeWindow()
        }}
      />
      <Icon name="park-close" className={styles.icon} fill="#8590ae" cursor="pointer" onClick={() => window.close()} />
    </Content>
  )
}
export default TitleBar
