import Container from '@/components/base/container'
import DocumentDetails from '@/components/documentDetail'
import { FC, useCallback, useEffect, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { RecentlyAddCard, RecentlyVisitCard } from './Card'
import Header from './Header'
import { AnimatePresence, motion, PanInfo, useDragControls } from 'framer-motion'
import styles from './index.module.less'
import { Content } from '@/components'
import { useGlobalLocation } from '@/routes/globalLocation'

export const HomePage: FC = () => {
  const location = useGlobalLocation()
  const homeBackground = location.state && location.state.homeBackground

  return (
    <Container className={styles.home} auto column>
      <Header />
      <Content className={styles.body}>
        <RecentlyVisitCard />
        <RecentlyAddCard />
      </Content>
      <AnimatePresence>
        {homeBackground && (
          <Routes location={location} key={location.pathname}>
            <Route path="document/details">
              <Route path=":id" element={<AnimatedDocumentDetails />} />
            </Route>
          </Routes>
        )}
      </AnimatePresence>
    </Container>
  )
}

const AnimatedDocumentDetails = () => {
  const [draggable, setDraggable] = useState(true)
  const navigate = useNavigate()
  const dragControls = useDragControls()
  function startDrag(event) {
    dragControls.start(event)
    document.addEventListener('mousemove', dragHandler)
  }
  const dragHandler = useCallback(e => {
    e.preventDefault()
  }, [])
  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    event.preventDefault()
    const windowHeight = window.innerHeight
    const distance = windowHeight - info.point.y
    if (distance / windowHeight < 0.1 && draggable) {
      setDraggable(false)
      navigate('/home')
      document.removeEventListener('mousemove', dragHandler)
    }
  }
  const handleDragEnd = () => {
    document.removeEventListener('mousemove', dragHandler)
  }
  return (
    <motion.div className={styles.documentDetailsContainer}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className={styles.documentDetailsOverlay}
        onClick={() => navigate('/home')}
      ></motion.div>
      <motion.div
        initial={{ y: '100%' }}
        className={styles.documentDetailsContent}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.4, stiffness: 200, damping: 30 }}
        drag={draggable ? 'y' : false}
        dragControls={dragControls}
        dragConstraints={{ top: 0 }}
        dragElastic={0}
        dragListener={false}
        dragMomentum={false}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      >
        <div onPointerDown={startDrag} className={styles.documentDetailsDragHandleContainer}>
          <div className={styles.documentDetailsDragHandle}></div>
        </div>
        <DocumentDetails />
      </motion.div>
    </motion.div>
  )
}
