import { IIconAllProps } from '@icon-park/react/es/all'
import React from 'react'
import * as IconMap from './map'
function toPascalCase(val: string): string {
  return val.replace(/(^\w|-\w)/g, c => c.slice(-1).toUpperCase())
}
type IconType = keyof typeof IconMap
export default function CustomIcon(props: IIconAllProps) {
  const { type, ...extra } = props
  const realType = toPascalCase(type)
  return React.createElement(IconMap[realType as IconType], extra)
}
