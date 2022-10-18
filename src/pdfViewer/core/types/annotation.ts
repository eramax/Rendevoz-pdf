export enum AnnotationType {
  Text = 1,
  Link = 2
}

export interface IAnnotation {
  annotationFlags: number
  annotationType: AnnotationType
  rect: number[]
  rotation: number
  subtype: string
  pageIndex: number
  dest?: [{ num: number }]
}
