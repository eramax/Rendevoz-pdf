import { FC, ImgHTMLAttributes, ReactNode, useState } from 'react'
import Icon from './Icon'

const Image: FC<ImgHTMLAttributes<HTMLImageElement> & { placeHolderSize?: number; placeHolder?: ReactNode }> = ({
  placeHolderSize = 20,
  placeHolder,
  ...rest
}) => {
  const [loaded, setLoaded] = useState(false)
  return (
    <>
      {!loaded && (placeHolder || <Icon size={placeHolderSize} {...rest} fill="#8590aea8" name="park-pic" />)}
      <img {...rest} onLoad={() => setLoaded(true)} onError={() => setLoaded(false)}/>
    </>
  )
}

export default Image
