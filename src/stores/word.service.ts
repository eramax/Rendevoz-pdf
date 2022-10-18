import { SynonymsWordResult, TranslateWordResult } from '@/../typings/data'
import { request } from '@/utils/request'
import { googleTranslate } from '@/utils/translate/googleTranslate'

class WordService {
  async translate (from: string, to: string, query?: string) {
    return request<TranslateWordResult>('/api/v1/word/word/translate', { params: { query, from, to } })
  }

  async synonyms (query?: string, sentense?: string) {
    return request<SynonymsWordResult[]>('/word/synonym', { params: { query, sentense } })
  }

  async googleTranslate (text: string, from: string, to: string) {
    return googleTranslate(text,from,to)
  }
}

export default new WordService()
