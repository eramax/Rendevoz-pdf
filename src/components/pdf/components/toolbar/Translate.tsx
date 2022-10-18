import { googleTranslate } from '@/utils/translate/googleTranslate'
import { Content } from '@/components'
import { FC } from 'react'
import styles from './index.module.less'
import useSWRImmutable from 'swr/immutable'

const Translate: FC<{ translateInput?: string }> = ({ translateInput }) => {
  const normalizedInput = translateInput?.replace(/\n/g, '')
  const fetcher = () => {
    if (normalizedInput) {
      return googleTranslate(normalizedInput, 'en', 'zh-CN')
    }
  }
  const { data, error } = useSWRImmutable(`/api/translate/${normalizedInput}`, fetcher)
  console.log(data)
  return (
    <Content flex column style={{ maxHeight: 600, overflow: 'auto', minWidth: 400, maxWidth: 800 }}>
      <Content className={styles.subtitle} flex alignItems="center" justifyContent="flex-start">
        Provided By Google Translate
      </Content>
      <Content flex>
        <div className={styles.longText}>{translateInput}</div>
      </Content>
      <Content flex className={styles.translateDivider}>
        TranslateResult
      </Content>
      <Content flex>
        {data ? (
          <div className={styles.extract}>{data.data.trans.paragraphs[0]}</div>
        ) : error ? (
          <div>Some errors happened</div>
        ) : (
          <div>loading</div>
        )}
      </Content>
    </Content>
  )
}

export default Translate