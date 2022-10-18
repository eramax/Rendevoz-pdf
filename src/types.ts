export type PaginationParams = {
  limit?: number
  offset?: number
  sort?: string
  direction?: 'ASC' | 'DESC'
}
export type Position = {
  top?: number
  left?: number
}
export type PartialWithId<T> = Partial<T> & { id: number }
