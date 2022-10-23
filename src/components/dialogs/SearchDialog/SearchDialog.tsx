import { Noop } from '@/common/types'
import { Content, Icon, Tooltip } from '@/components/base'
import { getAutoCompletes, getTokens } from '@/utils/searchIndex'
import { css } from '@emotion/css'
import { FC, useEffect, useRef, useState } from 'react'
import { PrettyInput } from '../../custom/input/pretty'
import AutoCompleteList from './AutoComplete'
import SearchResult from './Result'

interface SearchDialogProps {
  onSearchComplete?: Noop
}
const SearchDialog: FC<SearchDialogProps> = ({ onSearchComplete }) => {
  const [autoCompletes, setAutoCompletes] = useState([])
  const [search, setSearch] = useState()
  const [autoCompleteVisible, setAutoCompleteVisible] = useState(false)
  const canAutoCompleteRef = useRef(true)
  // useEffect(() => {
  //   getTokens()
  // }, [])
  return (
    <div style={{ height: 300, width: 500 }}>
      <Content style={{ height: '55px' }}>
        <Content
          flex
          column
          className={css({
            position: autoCompleteVisible ? 'absolute' : 'relative',
            background: 'white',
            padding: '4px 0px 8px',
            transition: 'all 0.3s ease',
            borderRadius: 10,
            boxShadow: autoCompleteVisible ? 'rgba(149, 157, 165, 0.2) 0px 8px 24px' : undefined,
            zIndex: 30
          })}
        >
          <Content gap={15} flex alignItems="center" justifyContent="space-between">
            <PrettyInput
              displayText="Search"
              value={search}
              style={{ padding: '0px 10px' }}
              onChange={e => {
                setSearch(e.target.value)
                if (!e.target.value) {
                  canAutoCompleteRef.current = true
                }
                const v = e.target.value.split(' ')
                const last = v.pop()
                const autocompletes = getAutoCompletes(last)
                if (autocompletes.length > 0 && canAutoCompleteRef.current) {
                  setAutoCompleteVisible(true)
                } else {
                  setAutoCompleteVisible(false)
                }
                setAutoCompletes(autocompletes)
              }}
            />
            <Tooltip content="Regenerate keywords">
              <Icon onClick={() => getTokens()} fill="#8590ae" cursor="pointer" name="park-refresh" />
            </Tooltip>
          </Content>
          {autoCompleteVisible && (
            <AutoCompleteList
              style={{ width: '100%', marginTop: 3 }}
              values={autoCompletes}
              onClick={i => {
                setSearch(i)
                canAutoCompleteRef.current = false
                setAutoCompletes([])
                setAutoCompleteVisible(false)
              }}
            />
          )}
        </Content>
      </Content>
      <SearchResult onResultItemClick={onSearchComplete} queryString={search} />
    </div>
  )
}

export default SearchDialog
