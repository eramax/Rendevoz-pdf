import { Content, Icon, Image } from '@/components'
import useDb from '@/hooks/stores/useDb'
import useDocumentStore from '@/stores/document.store'
import { FC, memo, ReactNode, useEffect, useState } from 'react'
import { IPdfDocument } from '~/typings/data'
import styles from './index.module.less'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { useMeasure } from 'react-use'
import FullSizeLink from '@/components/base/FullSizeLink'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
interface CardProps {
  title: string
  children: ReactNode
}
const Card: FC<CardProps> = ({ title, children }) => {
  return (
    <Content className={styles.card} flex column>
      {title && (
        <Content className={styles.title} flex alignItems="center">
          <span>{title}</span>
          <span className={styles.divider}></span>
        </Content>
      )}
      {children}
    </Content>
  )
}

export default Card

export const RecentlyVisitCard = memo(() => {
  const { recentlyRead } = useDocumentStore()
  const [ref, { width }] = useMeasure()
  const count = Math.floor(width / 300)
  const { t } = useTranslation()
  return (
    <Card title={t('home.recently visit')}>
      <Content
        ref={ref}
        style={{
          gridTemplateColumns: `repeat(${count},minmax(0,1fr))`
        }}
        className={styles.cardList}
      >
        {Array.from(Array(count).keys()).map((i, idx) => recentlyRead[idx] && <RecentlyReadCardItemV2 document={recentlyRead[idx]} />)}
      </Content>
    </Card>
  )
})

const RecentlyReadCardItem = ({ document }: { document: IPdfDocument }) => {
  const location = useLocation()
  const [imgSrc, setImgSrc] = useState('')
  const [isHover, setIsHover] = useState(false)
  const db = useDb('blobs')
  const lastReadTime = format(document.lastReadAt, 'Y/M/d')

  useEffect(() => {
    const coverId = document.metadata?.coverBlobId
    if (coverId) {
      db.get(coverId).then(data => setImgSrc(data.data))
    }
  }, [])
  return (
    <motion.div onHoverStart={() => setIsHover(true)} onHoverEnd={() => setIsHover(false)} className={styles.itemWrapper}>
      <motion.div className={styles.coverWrapper}>
        <img className={styles.cover} src={imgSrc} />
        <motion.div
          data-isHover={isHover}
          animate={isHover ? { backdropFilter: 'blur(10px)' } : undefined}
          transition={{ type: 'keyframes', duration: 0.3 }}
          className={styles.description}
        >
          <motion.div layoutDependency={isHover} layout="position" transition={spring}>
            {/* <div className={styles.docTitle}>{document.metadata?.title || document.name}</div>
            <div className={styles.readTime}>Last read at {lastReadTime}</div> */}
          </motion.div>
          <AnimatePresence exitBeforeEnter>
            {isHover && (
              <motion.div variants={details} initial="hidden" animate="visible" exit="hidden">
                <Content flex column>
                  <Content flex alignItems="center" className={styles.tags}>
                    <Icon size={12} style={{ marginRight: 10 }} name="park-tag-one" />
                    <span>Math</span>
                    <span>Physics</span>
                  </Content>
                  <Content flex alignItems="center" className={styles.tap}>
                    <Icon size={12} style={{ marginRight: 6 }} name="park-right" />
                    <span>Tap to see more</span>
                  </Content>
                </Content>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      <div className={styles.docTitle}>{document.metadata?.title || document.name}</div>
      <FullSizeLink onClick={() => setIsHover(false)} to={`/document/details/${document.id}`} state={{ homeBackground: location }} />
    </motion.div>
  )
}
const RecentlyReadCardItemV2 = ({ document }: { document: IPdfDocument }) => {
  const location = useLocation()
  return (
    <Content flex className={styles.itemWrapperV2}>
      <FullSizeLink style={{ zIndex: 3 }} to={`/document/details/${document.id}`} state={{ homeBackground: location }} />
      <div style={{ minHeight: 80, minWidth: 90 }}>
        <Content fullWidth fullHeight flex centered className={styles.coverWrapperV2}>
          <Image
            placeHolder={
              <div style={{ inset: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={40} fill="#8590aea8" name="park-pic" />
              </div>
            }
            draggable={false}
            className={styles.coverV2}
            src={document.metadata?.coverUrl || 'https://picsum.photos/200/300'}
          />
        </Content>
      </div>
      <Content flex alignItems="flex-end" className={styles.detailsWrapper}>
        <Content flex column className={styles.details} fullHeight justifyContent="space-between">
          <div className={styles.titleV2}>{document.metadata?.title || document.name}</div>
          <div className={styles.descV2}>{document.metadata?.author || 'Unknown'}</div>
          <div className={styles.progressTrack}>
            <div className={styles.progressThumb} style={{ width: `${(document.readProgress || 0) * 100}%` }}></div>
          </div>
        </Content>
        <Content className={styles.iconWrapper} flex alignItems="flex-end" style={{ marginLeft: 10 }}>
          <Icon name="park-right" size={24} style={{ padding: 8, borderRadius: 999, background: '#8590ae', color: 'white' }} />
          <FullSizeLink to={`/pdf/${document?.id}`} />
        </Content>
      </Content>
    </Content>
  )
}
const spring = {
  duration: 0.4,
  stiffness: 200,
  damping: 30
}
const details = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.4
    }
  },
  visible: {
    opacity: 1,
    height: '100%',
    transition: {
      delay: 0.4,
      duration: 0.4
    }
  }
}

export const RecentlyAddCard = memo(() => {
  const { recentlyCreated } = useDocumentStore()
  const [ref, { width }] = useMeasure()
  const count = Math.floor(width / 300)
  const { t } = useTranslation()
  return (
    <Card title={t('home.recently add')}>
      <Content
        ref={ref}
        style={{
          gridTemplateColumns: `repeat(${count},minmax(0,1fr))`
        }}
        className={styles.cardList}
      >
        {Array.from(Array(count).keys()).map(
          (i, idx) => recentlyCreated[idx] && <RecentlyReadCardItemV2 document={recentlyCreated[idx]} />
        )}
      </Content>
    </Card>
  )
})
