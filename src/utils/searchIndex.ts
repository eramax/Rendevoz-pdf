import fuzzysort from 'fuzzysort'
import { default as init, cut } from '@/assets/jieba_rs_wasm.js'

export let idx: SearchIndex
// Type definitions for search-index 3.0

interface SearchIndexOptions {
  cacheLength?: number | undefined
  caseSensitive?: boolean | undefined
  name?: string | undefined
  tokenAppend?: string | undefined
  stopwords?: string[] | undefined
}

interface Page {
  NUMBER: number
  SIZE: number
}

type Type = 'NUMERIC' | 'ALPHABETIC'

type Direction = 'ASCENDING' | 'DESCENDING'

interface AND {
  AND: Token[]
}

interface NOT {
  INCLUDE: Token
  EXCLUDE: Token
}

interface OR {
  OR: Token[]
}

interface SEARCH {
  SEARCH: Token[]
}

type QueryVerb = AND | NOT | OR | SEARCH

type Field = string | string[]

interface RangeValueObject {
  GTE: string | number
  LTE: string | number
}

interface FieldValueObject {
  FIELD: Field
  VALUE: string | RangeValueObject
}

interface FieldOnlyObject {
  FIELD: Field
}

type Token = Field | FieldValueObject | FieldOnlyObject | QueryVerb

interface Sort {
  TYPE: Type
  DIRECTION: Direction
  FIELD: string
}

type Score = 'TFIDF' | 'SUM' | 'PRODUCT' | 'CONCAT'

type AlterToken = (token: Token) => Promise<Token>

interface Weight {
  FIELD: string
  VALUE: string
  WEIGHT: number
}

interface QueryOptions {
  BUCKETS?: string[]
  DOCUMENTS?: boolean
  FACETS?: Token[]
  PAGE?: Page
  PIPELINE?: AlterToken
  SCORE?: Score
  SORT?: Sort
  WEIGHT?: Weight[]
}

interface NGram {
  lengths: number[]
  join: string
  fields?: string[]
}

type ReplaceValues = {
  [key in string]: string[]
}

interface Replace {
  fields: string[]
  values: ReplaceValues
}

type TokenizerArgs = [tokens: string, field: string, ops: PutOptions]
type SplitTokenizerArgs = [tokens: string[], field: string, ops: PutOptions]
type Tokenizer = (...args: TokenizerArgs) => Promise<string[]>
type SplitTokenizerStage = (args: TokenizerArgs) => Promise<SplitTokenizerArgs>
type TokenizerStage = (args: SplitTokenizerArgs) => Promise<SplitTokenizerArgs>

interface PutOptions {
  caseSensitive?: boolean
  ngrams?: NGram
  replace?: Replace
  skipField?: string[]
  stopwords?: string[]
  storeRawDocs?: boolean
  storeVectors?: boolean
  tokenizer?: Tokenizer
}

interface QueryResultItemNoDoc {
  _id: string
  _match: string[]
}

interface QueryResultItem {
  _id: string
  _match: string[]
  _doc: any[]
}

interface QueryResult {
  RESULT: QueryResultItem[] | QueryResultItemNoDoc[]
  RESULT_LENGTH: number
}

interface AllDocumentsResultItem {
  _id: number
  _doc: any
}

interface FieldValueIdObject extends FieldValueObject {
  _id: string[]
}

interface Operation {
  _id: string
  operation: string
  status: string
}

interface FieldValue {
  FIELD: string
  VALUE: string
}

interface KeyValue {
  key: string
  value: any
}

interface TokenizationPipelineStages {
  SPLIT: SplitTokenizerStage
  SKIP: TokenizerStage
  LOWCASE: TokenizerStage
  REPLACE: TokenizerStage
  NGRAMS: TokenizerStage
  STOPWORDS: TokenizerStage
  SCORE_TERM_FREQUENCY: TokenizerStage
}

interface SearchIndex {
  INDEX: any
  QUERY(query: Token, options?: QueryOptions): Promise<QueryResult>
  SEARCH(token: Token): Promise<QueryResult>
  ALL_DOCUMENTS(limit?: number): Promise<AllDocumentsResultItem[]>
  BUCKETS(...tokens: ReadonlyArray<Token>): Promise<FieldValueIdObject[]>
  DELETE(...docIds: ReadonlyArray<string>): Promise<Operation[]>
  CREATED(): Promise<number>
  DICTIONARY(token?: Token): Promise<string[]>
  DOCUMENTS(...docIds: ReadonlyArray<string>): Promise<any[]>
  DISTINCT(token?: Token): Promise<FieldValue[]>
  DOCUMENT_COUNT(): Promise<number>
  EXPORT(): Promise<KeyValue[]>
  FACETS(token?: Token): Promise<FieldValueIdObject[]>
  FIELDS(): Promise<string[]>
  FLUSH(): Promise<void>
  IMPORT(index: ReadonlyArray<KeyValue>): Promise<void>
  MIN(token?: Token): Promise<string>
  MAX(token?: Token): Promise<string>
  PUT(documents: ReadonlyArray<any>, options?: PutOptions): Promise<Operation[]>
  PUT_RAW(documents: ReadonlyArray<any>): Promise<Operation[]>
  TOKENIZATION_PIPELINE_STAGES: TokenizationPipelineStages
}

export const initSearchIndex = () => {
  SearchIndex({ skipFields: ['type'], storeVectors: true }).then(i => {
    idx = i
    getTokens()
  })
}
let initialized = false
const loadJieba = () => {
  if (initialized) return Promise.resolve()
  else {
    getTokens()
    return init().then(() => (initialized = true))
  }
}

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
  const { PUT, TOKENIZATION_PIPELINE_STAGES } = idx
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
  return chineseTokenizedPut(docs)
}
export const bulkDeleteFromSearchDb = (ids: number[]) => {
  const { DELETE } = idx
  return DELETE(...ids)
}
export const getTokens = () => {
  const { DICTIONARY } = idx
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
  const { QUERY } = idx
  return QUERY({ OR: queryString }, { DOCUMENTS: true }).then(data => {
    const results = data.RESULT.map(i => ({
      id: i._id,
      doc: i._doc
    }))
    return Promise.resolve(results)
  })
}
