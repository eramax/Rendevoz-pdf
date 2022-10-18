import { FC } from 'react'
import { NavLink, NavLinkProps, Route } from 'react-router-dom'
type NavLinkWithChildrenProps = Omit<NavLinkProps, 'children'> & {
  exact?: boolean
  to: string
  activeStyle?: React.CSSProperties
  children: (isActive: boolean) => React.ReactNode
}
const NavLinkWithChildren: FC<NavLinkWithChildrenProps> = ({ to, children, activeStyle, ...rest }) => {
  return (
    <NavLink to={to} className={rest.className} style={({ isActive }) => (isActive ? activeStyle : undefined)}>
      {({ isActive }) => (children ? children(isActive) : null)}
    </NavLink>
  )
}
export default NavLinkWithChildren
