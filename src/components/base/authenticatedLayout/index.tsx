import { FC } from 'react'
import Layout from '../layout'
import { Sidebar } from '../sidebar'

interface Props {
  children?: React.ReactNode
}
const AuthenticatedLayout: FC<Props> = ({ children }) => {
  return <Layout sidebar={<Sidebar />}>{children}</Layout>
}

export default AuthenticatedLayout
