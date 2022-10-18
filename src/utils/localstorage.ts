export function save (key: string, object: any) {
  localStorage.setItem(key, JSON.stringify(object))
}
export function find<T> (key: string): T {
  const json = localStorage.getItem(key)
  return JSON.parse(json || '')
}
