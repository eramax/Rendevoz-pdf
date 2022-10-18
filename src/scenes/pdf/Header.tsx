import { Content, Icon, WithBorder } from '@/components'
import usePdfInfo from '@/components/pdf/hooks/usePdfInfo'
import styles from './index.module.less'
import { motion } from 'framer-motion'
import IconWithPopover from '@/components/base/IconWithPopover'
import PdfViewerToolMenu from '@/components/menus/PdfViewerToolMenu'
import useEventEmitter from '@/events/useEventEmitter'
import useCleanMode from '@/components/pdf/hooks/useCleanMode'

const PdfPageHeader = () => {
  const [pdfInfo, setPdfInfo] = usePdfInfo()
  const [cleanMode, setCleanMode] = useCleanMode()
  const emitter = useEventEmitter()
  return (
    <Content className={styles.header} flex alignItems="center" justifyContent="space-between">
      <Content flex column>
        <div className={styles.title}>{pdfInfo?.metadata?.title || pdfInfo?.name}</div>
        <div className={styles.author}>{pdfInfo?.metadata?.author || 'Unknown'}</div>
      </Content>
      <Content flex alignItems="center" style={{ gap: 20 }}>
        {/* <Icon
          className={styles.star}
          size={20}
          cursor="pointer"
          name="park-star"
          theme={pdfInfo?.starred ? 'filled' : 'outline'}
          onClick={() => setPdfInfo({ ...pdfInfo, starred: !pdfInfo?.starred })}
          fill={pdfInfo?.starred ? 'rgb(246, 192, 80)' : undefined}
        /> */}
        <IconWithPopover
          name="park-more"
          size={20}
          placement={['left']}
          zIndex={100000}
          content={
            <WithBorder>
              <PdfViewerToolMenu
                onZoomOut={() => emitter.emit('pdf', { type: 'zoomOut' })}
                onZoomIn={() => emitter.emit('pdf', { type: 'zoomIn' })}
                onPan={() => emitter.emit('pdf', { type: 'togglePan' })}
                onAutoFit={() => emitter.emit('pdf', { type: 'autoFit' })}
                onClean={() => setCleanMode(!cleanMode)}
              />
            </WithBorder>
          }
        />
      </Content>
      <div className={styles.progressTrack}>
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${(pdfInfo?.readProgress || 0) * 100}%` || `0%` }}
          transition={{ damping: 30, stiffness: 200, duration: 0.2 }}
          className={styles.progress}
        ></motion.div>
      </div>
    </Content>
  )
}

export default PdfPageHeader
