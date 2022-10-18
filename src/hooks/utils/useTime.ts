import { format } from 'date-fns'

function useTime(): number
function useTime(time: number): string
function useTime(time?: number) {
  if (time) {
    return format(time, 'd MMM yyyy')
  }
  return Date.now()
}
export default useTime
