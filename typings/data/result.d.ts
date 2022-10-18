export interface RendevozResult<T> {
  code: number
  message: string
  time: number
  data?: T
}
export interface ListData<T>{
  items: T[]
  count?: number
}
