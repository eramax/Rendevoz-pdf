/* eslint-disable prettier/prettier */
import { Content, Icon, WithBorder } from '@/components'
import Select from '@/components/base/select'
import { FC, useMemo, useState } from 'react'
import { usePdfNote } from '../../hooks/usePdfNote'
import styles from './index.module.less'
import fuzzysort from 'fuzzysort'
import { useTime,useDebounce,useDebounceFn } from '@/hooks'
import IconWithPopover from '../../../base/IconWithPopover'
import Menu from '@/components/base/menu'
import { PrettyInput } from '@/components/custom/input/pretty'
import { Noop } from '@/common/types'
import { IHighlightLabel, IThoughtLabel } from '~/typings/data'
import useEventEmitter from '@/events/useEventEmitter'

enum Sort{
  MostRecentlyCreated = 'most recently created',
  LeastRecentlyCreated = 'least recently created',
  MostRecentlyModified = 'most recently modified',
  LeastRecentlyModified = 'least recently modifed'
}
const NoteInfo = () => {
  const [pdfNote] = usePdfNote()
  const [input, setInput] = useState('')
  const [conditions, setConditions] = useState([])
  const [sort,setSort] = useState<Sort>(Sort.MostRecentlyCreated)
  const {run} = useDebounceFn((i: string) => {
    setInput(i)
  },{wait: 200})

  const debounceNote = useDebounce(pdfNote,{wait: 200})
  const originalObjects = useMemo(() => (conditions.length
    ? conditions
        .map(c => {
          const labels = pdfNote.labels.slice()
          if (Array.isArray(labels)) {
            return labels.filter( i => i.type === c)
          }
          return []
        })
        .flat(1)
    : pdfNote.labels.slice()),[debounceNote,conditions])

  const searchResults = useMemo(() => fuzzysort.go(input, originalObjects, { keys: ['content', 'title', 'selectedText'] ,threshold: -1000000}), [input, conditions])

  const finalResults = input === '' ? originalObjects : Array.from(searchResults.values()).map(i => i.obj)

  const resultCount = finalResults.length

  const afterSortResults = useMemo(() => {
    switch(sort){
      case Sort.LeastRecentlyCreated: 
        return finalResults.sort((a,b) => 
          (a.createTime ?? 0) - (b.createTime ?? 0)
        )
      case Sort.MostRecentlyCreated: 
        return finalResults.sort((a,b) => (b.createTime ?? 0) - (a.createTime ?? 0))
      default: return finalResults
    }
  },[finalResults,sort])
  return (
    <Content className={styles.noteInfoContainer} flex column>
      <Content column flex>
        <Search onSearch={i => run(i)} />
        <Content style={{marginTop: 10}} alignItems='center' justifyContent="space-between" flex>
          <Filter onFilter={c => setConditions(c)} />
          <Sorter onSort={s => {setSort(s)}}/>
        </Content>
      </Content>
      <Content className={styles.resultContainer} flex column>
        <Content flex justifyContent="space-between">
          <div>{resultCount} Results</div>
        </Content>
        <Content flex column>
          {afterSortResults.map(i => 
            (
              <>
                  {i.type === 'highlight' && <Highlight key={i.id} label={i}/>}
                  {i.type === 'thought' && <Thought key={i.id} label={i}/>}
              </>
            )
          )}
        </Content>
      </Content>
    </Content>
  )
}

const Search: FC<{
  onSearch: (searchInput: string) => void
}> = ({ onSearch }) => {
  return <PrettyInput displayText="Search" onChange={e => onSearch(e.target.value)} />
}
const Filter: FC<{ onFilter: (conditions: string[]) => void }> = ({ onFilter }) => {
  return (
    <Select
      style={{marginRight: '20px'}}
      placeholder="Group by"
      onSelect={value => {
        onFilter(value)
      }}
      multiple
    >
      <Select.Option key="highlight" value="highlight">Highlight</Select.Option>
      <Select.Option key="thought" value="thought">Thought</Select.Option>
    </Select>
  )
}
const Sorter: FC<{ onSort: (sort: Sort) => void}> = ({onSort}) => {
  return (
    <Select placeholder='Sort by'
    closeOnSelect
    onSelect={value => {
      onSort(value[0])
    }}>
      <Select.Option key="mrc" value={Sort.MostRecentlyCreated}>Most Recently Created</Select.Option>
      <Select.Option key="lrc" value={Sort.LeastRecentlyCreated}>Least Recently Created</Select.Option>
    </Select>
  )
}

const LabelStatusBar: FC<{createTime: number,type: string,page: number}> = ({createTime,type,page}) =>{
  const emitter = useEventEmitter()
  return (
    <Content className={styles.statusBar} flex alignItems='center' justifyContent="flex-start">
      <Icon name="park-label"/>
      <span>{useTime(createTime)}</span>
      <Icon name="park-calendar"/>
      <span>{type}</span>
      <IconWithPopover zIndex={999} placement={['bottom','left']} name="park-more" content={
        <WithBorder>
          <LabelMenu onJumpBack={() => {
            emitter.emit('pdf',{
              type: 'jumpToPage',
              data: {
                pageIndex: page
              }
            })
          }}/>
        </WithBorder>
      }></IconWithPopover>
    </Content>
  )
}
const LabelMenu = ({onJumpBack,onAddToEditor}: {onJumpBack: Noop,onAddToEditor: Noop}) =>{
  return (
    <Menu>
      <Menu.Item type="button" onClick={onJumpBack}>Jump back</Menu.Item>
      <Menu.Item type="button" onClick={onAddToEditor}>Add to editor</Menu.Item>
    </Menu>
  )
}
const Highlight = ({label}: {label: IHighlightLabel}) =>{
  return (
    <Content className={styles.labelItem} flex column>
      {label.selectedText}
      <LabelStatusBar page={label.page} createTime={label.createTime} type="Highlight"/>
    </Content>
  )
}
const Thought = ({label} : {label: IThoughtLabel}) =>(
    <Content className={styles.labelItem} flex column>
      <LabelStatusBar createTime={label.createTime} page={label.page} type="Thought"/>
    </Content>
)

export default NoteInfo
