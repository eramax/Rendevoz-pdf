import { Content, WithBorder, Panel, Icon } from '@/components'
import { PrettyInput } from '@/components/custom/input/pretty'
import useEventEmitter from '@/events/useEventEmitter'
import { usePrevious, useToggle } from '@/hooks'
import classNames from 'classnames'
import produce from 'immer'
import { FC, useCallback, useState } from 'react'
import { RenderElementProps, useSelected } from 'slate-react'
import { ThoughtElement } from '../../customTypes'
import styles from './index.module.less'

interface ThoughtProps {}
const Thought: FC<ThoughtProps & RenderElementProps> = ({ children, element, attributes }) => {
  const emitter = useEventEmitter()
  const selected = useSelected()
  const thoughtElement = element as ThoughtElement
  selected && console.log(thoughtElement.id)
  const handleContentChange = useCallback((value: string) => {
    const newElement = produce(thoughtElement, d => {
      d.content = value
    })
    console.log(thoughtElement.id)
    emitter.emit('editor', {
      type: 'elementPropertyChange',
      data: {
        element: newElement
      }
    })
  }, [])
  const handleTitleChange = useCallback((value: string) => {
    const newElement = produce(thoughtElement, d => {
      d.title = value
    })
    emitter.emit('editor', {
      type: 'elementPropertyChange',
      data: {
        element: newElement
      }
    })
  }, [])
  const containerClassName = classNames(styles.thoughtContainer, selected && styles.selected)
  return (
    <div contentEditable={false} {...attributes} className={containerClassName}>
      <Content auto flex column>
        <Panel
          defaultVisible={false}
          title={
            <ThoughtTitle
              defaultTitle={thoughtElement.title}
              onChange={value => {
                handleTitleChange(value)
              }}
            />
          }
        >
          <Content flex column className={styles.thoughtInnerContainer}>
            <Panel title="Details">
              <div
                onClick={() => {
                  emitter.emit('pdf', {
                    type: 'jumpToComponent',
                    data: {
                      type: 'thought',
                      id: thoughtElement.originId
                    }
                  })
                }}
              >
                Jump Back
              </div>
              <div
                onClick={() => {
                  emitter.emit('editor', {
                    type: 'toggleThoughtLayer'
                  })
                }}
              >
                toggle Thought Mindmap
              </div>
            </Panel>
            <Panel defaultVisible={false} title="Content">
              <PrettyInput
                defaultValue={thoughtElement.content}
                displayText="Content"
                textarea
                onChange={e => {
                  handleContentChange(e.target.value)
                }}
              />
            </Panel>
          </Content>
        </Panel>
      </Content>
      {children}
    </div>
  )
}
interface ThoughtTitleProps {
  onChange: (value: string) => void
  defaultTitle: string
}
const ThoughtTitle: FC<ThoughtTitleProps> = ({ onChange, defaultTitle }) => {
  const [inputVisible, toggleInputVisible] = useToggle(false)
  const [iconVisible, setIconVisible] = useState(false)
  const [title, setTitle] = useState(defaultTitle)
  if (title !== defaultTitle) {
    setTitle(defaultTitle)
  }
  return (
    <Content
      onMouseEnter={() => setIconVisible(true)}
      onMouseLeave={() => setIconVisible(false)}
      flex
      alignItems="center"
      justifyContent="flex-start"
    >
      {inputVisible ? (
        <PrettyInput
          onClick={e => e.stopPropagation()}
          displayText="Title"
          defaultValue={title}
          onChange={e => {
            setTitle(e.target.value)
            onChange(e.target.value)
          }}
        />
      ) : (
        <span className={styles.title}>{title}</span>
      )}
      <Icon
        style={{
          opacity: iconVisible ? 1 : 0,
          transition: 'all 0.2s ease'
        }}
        size={18}
        onClick={e => {
          e.stopPropagation()
          toggleInputVisible()
        }}
        name="park-edit"
      />
    </Content>
  )
}

export default Thought
