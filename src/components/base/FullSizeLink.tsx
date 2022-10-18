import { FC } from 'react'
import { Link } from 'react-router-dom'
import { LinkProps } from 'react-router-dom'

const FullSizeLink: FC<LinkProps> = props => {
  return <Link {...props} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, ...props.style }} />
}
export default FullSizeLink