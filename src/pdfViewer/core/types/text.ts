import { CSSProperties } from 'react'

export interface TextItemChar {
  transform: any
  str: string
}
export interface TextItem {
  str: string
  /**
   * - Text direction: 'ttb', 'ltr' or 'rtl'.
   */
  dir: string
  /**
   * - Transformation matrix.
   */
  transform: Array<number>
  /**
   * - Width in device space.
   */
  width: number
  /**
   * - Height in device space.
   */
  height: number
  /**
   * - Font name used by PDF.js for converted font.
   */
  fontName: string
  /**
   * - Indicating if the text content is followed by a
   * line-break.
   */
  hasEOL: boolean
  /**
   *
   */
  chars: Array<TextItemChar>
}
export interface TextContentBound {
  offset: { left: number; right: number; top: number; bottom: number; size: number[]; trans: TextContentTrans }
  textItem: TextItem
  style: CSSProperties
  str: string
}
export type TextContentOffset = {
  left: number
  right: number
  top: number
  bottom: number
  size: number[]
  trans: TextContentTrans
}
export interface TextRect {
  x: number
  y: number
  width: number
  height: number
  text: string
  offset?: any
}
export type TextContentTrans = number[]
