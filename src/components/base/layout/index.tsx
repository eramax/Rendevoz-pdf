import useSidebarWidth from '@/hooks/components/useSidebarWidth'
import { FC } from 'react'
import { Helmet } from 'react-helmet'
import Container from '../container'

interface LayoutProps {
  sidebar?: React.ReactNode
  children?: React.ReactNode
}

const Layout: FC<LayoutProps> = ({ sidebar, children }) => {
  const [sidebarWidth] = useSidebarWidth()
  return (
    <Container auto column style={{ maxHeight: 'calc( 100vh - 30px )', minHeight: 'calc( 100vh - 30px )', overflowY: 'scroll' }}>
      <Helmet>
        <title>Rendevoz</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      <Container auto>
        {sidebar}
        <Container style={{ marginLeft: sidebarWidth, transition: 'margin-left 0.3s ease-out' }} auto>
          {children}
        </Container>
      </Container>
    </Container>
  )
}

export default Layout
