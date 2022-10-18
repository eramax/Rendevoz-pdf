import axiosClient from '@/config/axiosClient'
import { AxiosRequestConfig, AxiosResponse } from 'axios'

type RequestMethod = <T = any>(
  url: string,
  options: AxiosRequestConfig<any>
) => Promise<AxiosResponse<T>>

const request: RequestMethod = (url: any, options: any) => {
  return axiosClient({ url: url, ...options })
}

export { request }
