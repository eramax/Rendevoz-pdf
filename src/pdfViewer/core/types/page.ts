import { ReactElement } from 'react'

export interface PageSize {
  width: number
  height: number
  scale: number
}

export interface RenderPageProps {
  canvasLayer: ReactElement
  textLayer: ReactElement
  annotationLayer: ReactElement
  pageIndex: number
  pageSize: PageSize
}
