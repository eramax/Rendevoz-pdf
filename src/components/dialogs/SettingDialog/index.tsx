import { Content, TabPane, Tabs } from '@/components/base'
import Select from '@/components/base/select'
import { useTranslation } from 'react-i18next'
import { useLocalStorage } from 'react-use'

const SettingDialog = () => {
  const { i18n } = useTranslation()
  const [value, setValue, remove] = useLocalStorage('lang', undefined, {
    raw: true
  })
  return (
    <Content alignItems="baseline" flex fullHeight gap={20} fullWidth>
      <div>Language: </div>
      <Select
        closeOnSelect
        defaultValue={value || 'en-US'}
        onSelect={v => {
          i18n.changeLanguage(v[0])
          setValue(v[0])
        }}
      >
        <Select.Option value="en-US">English</Select.Option>
        <Select.Option value="zh-CN">Chinese</Select.Option>
      </Select>
    </Content>
  )
}

export default SettingDialog
