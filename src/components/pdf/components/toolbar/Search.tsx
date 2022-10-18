import { Content } from '@/components'
import { FC } from 'react'
import styles from './index.module.less'
import useSWRImmutable from 'swr/immutable'
import { WikiSearchResult } from './TextSelectionToolbar'

const Search: FC<{ searchInput?: string }> = ({ searchInput }) => {
  const normalizedInput = searchInput?.replace(/ /g, '_')
  const fetcher = (url: string) => fetch(url).then(res => res.json())
  const { data, error } = useSWRImmutable<WikiSearchResult>(`https://en.wikipedia.org/api/rest_v1/page/summary/${normalizedInput}`, fetcher)
  const { data: more } = useSWRImmutable(`https://en.wikipedia.org/api/rest_v1/page/mobile-sections/${normalizedInput}`, fetcher)
  return data ? (
    <Content flex column style={{ maxHeight: 600, overflow: 'auto', minWidth: 200, maxWidth: 800 }}>
      <Content className={styles.title} flex alignItems="center" justifyContent="flex-start">
        {data.title}
      </Content>
      {data.type === 'standard' && (
        <Content flex alignItems="center">
          {data.thumbnail && <img className={styles.thumbnail} src={data.thumbnail.source} />}
          <Content flex column justifyContent="flex-start">
            <Content className={styles.subtitle} flex>
              {data.description}
            </Content>
            <Content className={styles.extract} flex>
              {data.extract}
            </Content>
          </Content>
        </Content>
      )}
      {data.type === 'disambiguation' && (
        <Content flex centered>
          Your search have multiple results,thus will not show here
        </Content>
      )}
    </Content>
  ) : error ? (
    <div>error</div>
  ) : (
    <div>loading</div>
  )
}

export default Search
