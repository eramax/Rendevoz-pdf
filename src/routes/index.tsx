import Collection from '@/components/collection'
import AuthenticatedLayout from '@/components/base/authenticatedLayout'
import Collections from '@/scenes/collections'
import { HomePage } from '@/scenes/home'
import { Suspense } from 'react'
import { Route, Routes as RouterRoutes, useLocation } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from '@/components/base/errorFallback'
import EditorPage from '@/scenes/editor'
import DocumentDetails from '@/components/documentDetail'
import TransitionRoute from './TransitionRoute'
import { AnimatePresence } from 'framer-motion'
import PdfPage from '@/scenes/pdf'
import { GlobalLocationContextProvider } from './globalLocation'
const Routes = () => {
  const location = useLocation()
  const homeBackground = location.state && location.state.homeBackground
  console.log(location, homeBackground)
  return (
    <GlobalLocationContextProvider value={location}>
      <AuthenticatedLayout>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<div>loading ...</div>}>
            <AnimatePresence exitBeforeEnter>
              <RouterRoutes key={homeBackground?.pathname || location.pathname} location={homeBackground || location}>
                <Route
                  path="*"
                  element={
                    <TransitionRoute>
                      <HomePage />
                    </TransitionRoute>
                  }
                ></Route>
                <Route
                  path="/"
                  element={
                    <TransitionRoute>
                      <HomePage />
                    </TransitionRoute>
                  }
                >
                  <Route
                    path="home"
                    element={
                      <TransitionRoute>
                        <HomePage />
                      </TransitionRoute>
                    }
                  >
                    <Route path="document/details">
                      <Route path=":id" element={<DocumentDetails />} />
                    </Route>
                  </Route>
                </Route>
                <Route path="pdf">
                  <Route
                    path=":id/*"
                    element={
                      <TransitionRoute>
                        <PdfPage />
                      </TransitionRoute>
                    }
                  />
                </Route>
                <Route
                  path="editor"
                  element={
                    <TransitionRoute>
                      <EditorPage />
                    </TransitionRoute>
                  }
                >
                  <Route
                    path=":id"
                    element={
                      <TransitionRoute>
                        <EditorPage />
                      </TransitionRoute>
                    }
                  />
                </Route>
                <Route path="collections">
                  <Route
                    index
                    element={
                      <TransitionRoute>
                        <Collections />
                      </TransitionRoute>
                    }
                  />
                  <Route
                    path=":id"
                    element={
                      <TransitionRoute>
                        <Collections />
                      </TransitionRoute>
                    }
                  />
                </Route>
              </RouterRoutes>
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>
      </AuthenticatedLayout>
    </GlobalLocationContextProvider>
  )
}
export default Routes
