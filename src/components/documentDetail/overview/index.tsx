import useNoteStore from '@/stores/note.store'
import Id from '@/utils/id'
import classNames from 'classnames'
import { format } from 'date-fns'
import { useEffect,  useState } from 'react'
import { createSearchParams } from 'react-router-dom'
import { IPdfDocument } from '~/typings/data'
import { Content } from '../../base'
import FullSizeLink from '../../base/FullSizeLink'
import Timeline from '../../base/timeline'
import Icon from '../../base/Icon'
import styles from './index.module.less'

const Overview = ({ document }: { document?: IPdfDocument }) => {
  const noteId = 1
  const [notes, setNotes] = useState()
  const { getNotesByIds } = useNoteStore()
  useEffect(() => {
    if (document) {
      console.log(document)
      getNotesByIds(document?.noteIds).then(data => {
        setNotes(data)
        console.log(data)
      })
    }
  }, [document])
  return (
    <Content style={{ width: 800, margin: 'auto', padding: '30px 0' }} flex>
      <Content className={styles.main} flex centered>
        <Content flex column className={styles.mainInner}>
          <h1>{document?.metadata?.title || 'Untitled'}</h1>
          <span>{document?.description || 'No description'}</span>
          <h2>Notes</h2>
          <Content flex className={styles.cardContainer}>
            {notes
              ?.filter(i => i!)
              .map(i => (
                <NoteCard id={i?.id} title={i?.title} description="asddsa" />
              ))}

            <div className={classNames(styles.card, styles.add)}>
              <Icon name="park-plus" size={30} />
              <FullSizeLink
                to={{
                  pathname: `/editor/${Id.getId()}`,
                  search: createSearchParams({
                    documentId: String(document?.id)
                  }).toString()
                }}
              />
            </div>
          </Content>
          <div>More ....</div>
          {/* <h2>Tasks</h2>
          <Timeline iconSize={18}>
            <Timeline.Item style={{ fontSize: 16, fontWeight: 600 }} iconColor="green" iconName="park-diamond-three">
              UI/UX
            </Timeline.Item>
            <Timeline.Item iconName="park-check-one" iconTheme="multi-color" iconFill={['rgba(0,0,0,0)', '#51a06f', '#ffffff', '#ffffff']}>
              UX/UI
            </Timeline.Item>
            <Timeline.Item
              iconName="park-add-one"
              iconTheme="multi-color"
              iconFill={['transparent', 'rgba(117,114,114)', '#9b9b9b', '#4a4a4a']}
            >
              You created one task one week ago
            </Timeline.Item>
            <Timeline.Item iconName="park-time" iconColor="rgba(74,74,74,0.8)">
              Create One Dog
            </Timeline.Item>
          </Timeline> */}
        </Content>
      </Content>
      <Content className={styles.sidebar} flex column>
        <SidebarTextItem title="Start Read Date" text={format(document?.createdAt || 0, 'd MMM yyyy')} />
        <SidebarTextItem title="Last Read Date" text={format(document?.lastReadAt || 0, 'd MMM yyyy')} />
        <Content position="relative" flex centered className={styles.continue}>
          <span>CONTINUE</span>
          <Icon name="park-right" />
          <FullSizeLink to={`/pdf/${document?.id}`} />
        </Content>
        {/* <div style={{ width: '100%', height: 1, backgroundColor: 'grey' }}></div> */}
        {/* <div className={classNames(styles.card, styles.sidebar)}>
          <Content style={{ padding: '0 20px' }} flex column fullWidth fullHeight justifyContent="center">
            <Content flex alignItems="baseline" justifyContent="space-between">
              <h4>Reading progress</h4>
              <h3>20%</h3>
            </Content>
            <div className={styles.progressContainer}>
              <div style={{ width: '20%' }} className={styles.progress}></div>
              <div className={styles.progressTrack}></div>
            </div>
          </Content>
        </div> */}
      </Content>
    </Content>
  )
}
const NoteCard = ({ id, title, description }) => {
  return (
    <div className={styles.cardOuter}>
      <Content className={styles.card} flex>
        <Icon size={20} name="park-notes" />
        <Content flex column justifyContent="center" fullWidth style={{ overflow: 'hidden' }}>
          <h3>{title}</h3>
          <span className={styles.cardDesc}>{description}</span>
        </Content>
        <FullSizeLink to={`/editor/${id}`}></FullSizeLink>
      </Content>
    </div>
  )
}
const SidebarTextItem = ({ title, text }) => {
  return (
    <Content flex alignItems="center" justifyContent="space-between" className={styles.sidebarTextItem}>
      <span>{title}</span>
      <span>{text}</span>
    </Content>
  )
}
export default Overview
