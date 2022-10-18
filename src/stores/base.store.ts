import produce from 'immer'
import { orderBy } from 'lodash'

type PartialWithId<T> = Partial<T> & { id: number }

const BaseStore = {
  clear(data: Map<number, any>) {
    return produce(data, draft => {
      draft.clear()
    })
  },
  add(item: PartialWithId<any>, data: Map<number, any>) {
    return produce(data, draft => {
      draft.set(item.id, item)
    })
  },
  update(item: PartialWithId<any>, data: Map<number, any>) {
    return produce(data, draft => {
      draft.set(item.id, item)
    })
  },
  bulkAdd(items: PartialWithId<any>[], data: Map<number, any>) {
    return produce(data, draft => {
      items.forEach(i => draft.set(i.id, i))
    })
  },
  remove(id: number, data: Map<number, any>) {
    return produce(data, draft => {
      draft.delete(id)
    })
  },
  get<T>(id: number | undefined, data: Map<number, T>): T | undefined {
    if (id) {
      return data.get(id)
    }
  },
  orderedData<T>(data: Map<number, T>): T[] {
    return orderBy(Array.from(data.values()), 'createdAt', 'desc')
  }
}

export default BaseStore
