import { Label, ListData, RendevozResult } from '@/../typings/data'
import { request } from '@/utils/request'
import qs from 'qs'

class LabelService {
  async addLabel (label: Label) {
    return request<Label>('/api/v1/label/label/operate', { data: label, method: 'POST' })
  }

  async getLabels (docId: number, id?: number) {
    return request<Label[]>('/api/v1/label/label/query', { params: { docId, id } })
  }

  async updateLabel (label: Label) {
    return request<Label>('/api/v1/label/label/operate', { data: label, method: 'PUT' })
  }

  async getLabelsByPage (docId: number, start: number, next: number, direction: string) {
    return request<Label[]>('/api/v1/label/label/query/page', { params: { docId, start, next, direction } })
  }

  async getLabelsByPages (docId: number, pages: number[]) {
    pages = pages + ''
    return request<RendevozResult<ListData<Label>>>('/api/v1/label/label/query/pages', { params: { docId, pages }, paramsSerializer: params => qs.stringify(params) })
  }
}
export default new LabelService()
