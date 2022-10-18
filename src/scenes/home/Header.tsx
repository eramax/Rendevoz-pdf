import { Content, Icon, WithBorder } from '@/components'
import IconWithPopover from '@/components/base/IconWithPopover'
import NewDocumentMenu from '@/components/menus/NewDocumentMenu'
import { getHours } from 'date-fns'
import styles from './index.module.less'

const Header = () => {
  const currentHour = getHours(new Date())
  let currentTime
  if (currentHour >= 1 && currentHour < 11) {
    currentTime = 'Morning'
  }
  if (currentHour >= 11 && currentHour < 13) {
    currentTime = 'Noon'
  }
  if (currentHour >= 13 && currentHour < 18) {
    currentTime = 'Afternoon'
  }
  if (currentHour >= 18 && currentHour < 22) {
    currentTime = 'Evening'
  }
  if (currentHour >= 22 && currentHour < 23) {
    currentTime = 'Night'
  }
  if (currentHour >= 23 || currentHour === 0) {
    currentTime = 'Midnight'
  }
  return (
    <Content className={styles.header} flex alignItems="center" justifyContent="space-between">
      <div className={styles.greeting}>Good {currentTime}, welcome back</div>
      <Bar />
    </Content>
  )
}
const Bar = () => {
  return (
    <Content className={styles.bar} flex alignItems="center">
      {/* <div className={styles.search}>
        <Icon name="park-search" />
        <input placeholder="Search" />
      </div> */}
      <div className={styles.plus}>
        <IconWithPopover
          name="park-plus"
          placement={['left','bottom']}
          content={
            <WithBorder>
              <NewDocumentMenu />
            </WithBorder>
          }
        />
      </div>
    </Content>
  )
}
export default Header
