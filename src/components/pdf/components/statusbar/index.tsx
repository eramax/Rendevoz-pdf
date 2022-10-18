import { FC, useEffect, useState } from 'react'

interface Props {
  style?: React.CSSProperties
  className?: string
}
export const StatusBar: FC<Props> = ({ progress = 0, ...rest }) => {
  return <div className={rest.className} style={{ ...rest.style, display: 'flex' }}></div>
}
