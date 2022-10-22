import { Content, Panel, TabPane, Tabs } from '@/components'
import { isEditorInitialized } from '@/components/editor/EditorManager'
import useEventEmitter from '@/events/useEventEmitter'
import { useDebounceFn } from '@/hooks'
import useBlockStore from '@/stores/block.store'
import useNoteStore from '@/stores/note.store'
import { tokenize, search as searchIndex } from '@/utils/searchIndex'
import { css } from '@emotion/css'
import _ from 'lodash'
import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { INote } from '~/typings/data'

const SearchResult: FC<{
  queryString?: string
}> = ({ queryString }) => {
  const [blocks, setBlocks] = useState([])
  console.log(blocks)
  const { getBlocksByIds } = useBlockStore()
  const { getNoteById } = useNoteStore()
  const { run: query } = useDebounceFn(
    s => {
      tokenize(s).then(strArray => {
        searchIndex(strArray).then(data => {
          const blocks = data.filter(i => i.doc.type === 'block')
          getBlocksByIds(blocks.map(i => i.id)).then(res => setBlocks(res))
        })
      })
    },
    { wait: 300 }
  )
  useEffect(() => {
    if (queryString) {
      query(queryString)
    }
  }, [queryString])
  return (
    <Tabs defaultActiveKey="block">
      <TabPane tab="Blocks" key="block">
        {_(blocks)
          .groupBy(i => i?.noteId)
          .map((v, k) => ({ id: k, blocks: v }))
          .value()
          .map(i => (
            <NoteResultItem id={Number(i.id)} blocks={i.blocks} queryString={queryString} />
          ))}
      </TabPane>
    </Tabs>
  )
}
const NoteResultItem = ({ id, queryString, blocks }: { id: number; queryString: string; blocks: any[] }) => {
  const { getNoteById } = useNoteStore()
  const [note, setNote] = useState()
  useEffect(() => {
    getNoteById(id).then(n => setNote(n))
  }, [])
  return (
    <Panel
      style={{ marginBottom: 10 }}
      title={
        <div
          className={css({
            fontSize: 18,
            fontWeight: 600
          })}
        >
          {note?.title}
        </div>
      }
    >
      {blocks.map(i => (
        <BlockResultItem key={i.id} id={i.id} block={i} queryString={queryString} />
      ))}
    </Panel>
  )
}
const BlockResultItem = ({ id, queryString, block }: { id: number; queryString: string; block: any }) => {
  const emitter = useEventEmitter()
  const nav = useNavigate()
  const highlightedText = queryString.split(' ').reduce((prev, curr) => {
    if (curr) {
      return (prev as string)?.replaceAll(curr, `<b>${curr}</b>`)
    } else {
      return prev
    }
  }, block?.plain)
  const handleClick = () => {
    if (!isEditorInitialized) {
      nav(`/editor/${block.noteId}`)
    }
    setTimeout(() => {
      emitter.emit('editor', {
        type: 'jumpToBlock',
        data: {
          noteId: block.noteId,
          blockId: block.id
        }
      })
    }, 0)
  }
  return (
    <div
      onClick={handleClick}
      className={css({
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        borderRadius: 2,
        padding: '4px',
        ':hover': {
          background: 'rgba(0,0,0,0.05)'
        }
      })}
    >
      <span dangerouslySetInnerHTML={{ __html: highlightedText }}></span>
    </div>
  )
}
export default SearchResult
