import { DefaultPaginationLimit } from '@/consts/pagination'
import useMount from '@/hooks/utils/useMount'
import { PartialWithId } from '@/types'
import { Fragment, memo, useRef, useState } from 'react'
import useSWR from 'swr'

interface ListProps<T> {
  fetch: (options: Record<string, any>) => Promise<T[] | undefined>
  renderItem: (item: PartialWithId<T>, index: number) => React.ReactNode
  items: PartialWithId<T>[]
}
const List = <T,>({ fetch, renderItem, items }: ListProps<T>) => {
  const [isFetching, setIsFetching] = useState(false)
  const allowLoadMore = useRef(true)
  const offset = useRef(0)
  const [renderCount, setRenderCount] = useState(0)
  useMount(() => fetchItems())
  const fetchItems = async () => {
    if (!fetch) return
    setIsFetching(true)
    const limit = DefaultPaginationLimit
    const items = await fetch({
      limit: limit,
      offset: offset.current,
    })
    if (items && (items.length === 0 || items.length < limit)) {
      allowLoadMore.current = false
    } else {
      allowLoadMore.current = true
      offset.current += limit
    }
    setRenderCount(renderCount + limit)
    setIsFetching(false)
  }

  const loadMoreItems = async () => {
    if (!allowLoadMore.current || isFetching) {
      return
    }
    const leftToRender = (items.length ?? 0) - renderCount
    if (leftToRender > 0) {
      setRenderCount(renderCount + DefaultPaginationLimit)
    }
    if (leftToRender <= DefaultPaginationLimit) {
      await fetchItems()
    }
  }
  return isFetching ? (
    <div>loading</div>
  ) : (
    <>
      {items.slice(0, renderCount).map((item, index) => {
        const children = renderItem(item, index)
        return <Fragment key={item.id}>{children}</Fragment>
      })}
      {allowLoadMore.current && (
        <button onClick={loadMoreItems}>load more</button>
      )}
    </>
  )
}
export default List
