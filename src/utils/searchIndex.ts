import fuzzysort from 'fuzzysort'
import { default as init, cut } from '@/assets/jieba_rs_wasm.js'

export const idx = await SearchIndex({ skipFields: ['type'] })

let initialized = false
const loadJieba = () => {
  if (initialized) return Promise.resolve()
  else {
    return init().then(() => (initialized = true))
  }
}

const { QUERY, PUT, DICTIONARY, TOKENIZATION_PIPELINE_STAGES, SEARCH,DELETE } = idx
let tokens: string[] = []
enum SearchableField {
  name,
  title,
  plainText,
  author
}
export interface SearchableItem {
  itemId: number
  itemType: 'block'
  fields: Partial<Record<keyof typeof SearchableField, string>>
}
export const tokenize = (str: string) => {
  return loadJieba().then(() => {
    return cut(str, true)
  })
}
const chineseTokenizedPut = (docs: any[]) => {
  loadJieba().then(() => {
    PUT(
      docs,
      {
        tokenizer: (tokens, field, ops) =>
          TOKENIZATION_PIPELINE_STAGES.SPLIT([tokens, field, ops])
            .then(TOKENIZATION_PIPELINE_STAGES.SKIP)
            .then(TOKENIZATION_PIPELINE_STAGES.LOWCASE)
            .then(TOKENIZATION_PIPELINE_STAGES.REPLACE)
            .then(TOKENIZATION_PIPELINE_STAGES.NGRAMS)
            .then(TOKENIZATION_PIPELINE_STAGES.STOPWORDS)
            // björn -> bjorn, allé -> alle, etc.
            .then(([tokens, field, ops]) => {
              let newTokens = tokens
              if (tokens.length) {
                newTokens = tokens.map(i => cut(i, true)).flat(1)
              }
              return [newTokens, field, ops]
            })
            .then(TOKENIZATION_PIPELINE_STAGES.SCORE_TERM_FREQUENCY)
            .then(([tokens, field, ops]) => tokens)
      },
      {
        storeVectors: true
      }
    )
  })
}
export const importIntoSearchDb = ({ itemId, itemType, fields }: SearchableItem) => {
  const doc = {
    _id: itemId,
    type: itemType,
    ...fields
  }
  return chineseTokenizedPut([doc])
}
export const bulkImportIntoSearchDb = (items: SearchableItem[]) => {
  const docs = items.map(i => ({
    _id: i.itemId,
    type: i.itemType,
    ...i.fields
  }))
  console.log(docs)
  return chineseTokenizedPut(docs)
}
export const bulkDeleteFromSearchDb = (ids: number[]) => {
  return DELETE(...ids)
}
export const getTokens = () => {
  return DICTIONARY().then(data => (tokens = data))
}
export const getAutoCompletes = (q: string) => {
  const results = fuzzysort.go(q, tokens)
  return results.map(i => i.target)
}
interface SearchResult {
  id: number
  doc: {
    type: string
  }
}
export const search = (queryString: string): Promise<SearchResult[]> => {
  return QUERY({ OR: queryString }, { DOCUMENTS: true }).then(data => {
    console.log(data)
    const results = data.RESULT.map(i => ({
      id: i._id,
      doc: i._doc
    }))
    return Promise.resolve(results)
  })
}
