import { Content } from '@/components'
import { getHours } from 'date-fns'
import styles from './index.module.less'
import { useTranslation } from 'react-i18next'

const Header = () => {
  const { t } = useTranslation()
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
      <div className={styles.greeting}>{t('home.greeting', { time: currentTime })}</div>
    </Content>
  )
}
export default Header
