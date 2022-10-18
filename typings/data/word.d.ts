export interface TranslateWordResult{
  word: string
  translateResult: string
}
export interface SynonymsWordResult{
  definition: string
  synonyms: Synonym[]
  example: string
  score: number
}
export interface Synonym{
  wordId: number
  relationshipId: number
  liked: number
  word: string

}
