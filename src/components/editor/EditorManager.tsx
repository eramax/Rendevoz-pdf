import './dock.less'
import DockLayout, { DockContext, LayoutData, PanelData, TabData } from '../base/dock'
import { cloneElement, FC, useCallback, useEffect, useMemo, useRef } from 'react'
import EditorManagerMenu from '../menus/EditorManagerMenu'
import { useSelectedEditorRef } from './hooks/useSelectedEditorRef'
import useEventEmitter from '@/events/useEventEmitter'
import { EditorEventHandler } from '../../events/editorEvent'
import { EditorV1 } from './Editor'
import useNoteStore from '@/stores/note.store'
import { Descendant } from 'slate'
import { Content, WithBorder } from '../base'
import Id from '@/utils/id'
import IconWithPopover from '../base/IconWithPopover'
import toast from 'react-hot-toast'
import { INote } from '~/typings/data'


const EditorManagerMenuPopover = ({ panel = {} as PanelData, context = {} as DockContext }) => {
  const popoverRef = useRef()
  return (
    <Content flex centered style={{ marginRight: 15 }}>
      <IconWithPopover
        tooltip="More"
        placement={['bottom', 'left']}
        name="park-more"
        innerRef={popoverRef}
        zIndex={1000}
        padding={10}
        size={24}
        color="#8590ae"
        boundaryInset={20}
        content={
          <WithBorder>
            <EditorManagerMenu onClose={() => popoverRef.current?.close()} panel={panel} context={context} />
          </WithBorder>
        }
      />
    </Content>
  )
}
interface EditorManagerProps {
  initialNoteId?: number
  documentId?: number
  onSave?: number
}
const EditorManager: FC<EditorManagerProps> = ({ initialNoteId, documentId, onSave }) => {
  const selectedEditorRef = useSelectedEditorRef()
  const eventEmitter = useEventEmitter()
  const layoutRef = useRef<DockLayout>()
  const eventHandler = new EditorEventHandler()
  const firstNoteId = initialNoteId || Id.getId()
  const { saveNote, getNoteById, updateNote } = useNoteStore()

  eventHandler.on('foldHeading', data => {
    selectedEditorRef?.current?.foldHeading(data.headingId, data.folded)
  })
  eventHandler.on('insertNode', data => {
    selectedEditorRef?.current?.insertNode(data.element)
  })
  eventHandler.on('elementPropertyChange', data => {
    selectedEditorRef.current?.elementPropertyChange(data.element)
  })
  eventHandler.on('outerElementPropertyChange', data => {
    console.log(data)
    selectedEditorRef.current?.outerElementPropertyChange(data.element)
  })
  eventHandler.on('openMenu', () => {
    console.log('open')
  })
  eventHandler.on('toggleThoughtLayer', () => {
    selectedEditorRef.current?.toggleMindMapLayer()
  })
  eventHandler.on('deleteSubPage', data => {
    const subPageNoteId = data.subPageNoteId
    getNoteById(subPageNoteId)
      .then(note => ({
        ...note,
        parentNoteId: undefined
      }))
      .then(n => updateNote(n))
  })
  eventHandler.on('tabDataChange', data => {
    const { id, noteId, tab } = data
    const oldTab = layoutRef.current?.find(id) as TabData
    const newTitle = tab.title as string | undefined
    tab.title = cloneElement(oldTab.title, {}, newTitle)
    const newTab = {
      ...oldTab,
      ...tab
    }
    layoutRef.current?.updateTab(id, newTab)
  })
  eventHandler.on('insertTab', async data => {
    console.log(data)
    let id
    if (data.id) {
      id = data.id
    } else {
      id = Id.getStrId()
    }
    let panelId
    if (data.panelId) {
      panelId = data.panelId
    } else {
      panelId = layoutRef.current?.getGlobal().currentFocusedPanelId
      if (panelId === undefined) {
        panelId = layoutRef.current?.getLayout().dockbox.children[0].id
      }
    }
    // we are adding a sub page,so we need to save the note first
    if (data.parentNoteId) {
      const subPageNote: INote = {
        id: data.noteId,
        parentNoteId: data.parentNoteId,
        title: ''
      }
      return saveNote(subPageNote)?.then(() => {
        const editor = defaultEditor(id, subPageNote.id)
        layoutRef.current?.dockMove(editor, panelId, 'middle')
        eventEmitter.emit('editor', {
          type: 'switchTab',
          data: {
            tabId: id
          }
        })
        return
      })
    }
    if (panelId) {
      let editor = defaultEditor(id)
      const noteId = data.noteId
      if (noteId && !data.isNew) {
        // maybe it has been opened
        const mayBeTargetTab = layoutRef.current?.find(String(noteId)) as TabData | null
        if (mayBeTargetTab) {
          eventEmitter.emit('editor', {
            type: 'switchTab',
            data: {
              tabId: mayBeTargetTab.id
            }
          })
          return
        }
        const note = await getNoteById(noteId).catch(e => {
          return null
        })
        if (note) {
          editor = defaultEditor(id, noteId, note.title)
        } else {
          toast.error('Target note not found!')
        }
      }
      layoutRef.current?.dockMove(editor, panelId, 'middle')
      eventEmitter.emit('editor', {
        type: 'switchTab',
        data: {
          tabId: id
        }
      })
    }
  })
  eventHandler.on('deletePanel', data => {
    const panelId = data.panelId
    const currLayout = layoutRef.current?.getLayout()
    if (!currLayout || currLayout.dockbox.children.length === 1) {
      toast.error("Can't close all panels!")
      return
    }
    const panel = layoutRef.current?.find(panelId) as PanelData
    layoutRef.current?.dockMove(panel, null, 'remove')
  })
  eventHandler.on('switchTab', data => {
    const targetTab = layoutRef.current?.find(data.tabId || String(data.noteId))
    layoutRef.current?.updateTab(targetTab?.id, targetTab)
  })
  const defaultEditor = useCallback((id: string, noteId?: number, title?: string, content?: Descendant[]): TabData => {
    noteId = noteId || Id.getId()
    return {
      id,
      onTabClick: e => {
        eventEmitter.emit('editor', {
          type: 'switchTab',
          data: {
            tabId: id
          }
        })
      },
      title: <div>{title || 'Untitled'}</div>,
      content: (
        <div key={id} style={{ display: 'flex', height: '100%', paddingBottom: 30 }}>
          <EditorV1 key={id} id={id} noteId={noteId} initialValue={content} />
        </div>
      ),
      noteId,
      cached: true
    }
  }, [])
  const defaultLayout: LayoutData = useMemo(
    () => ({
      global: {
        globalPanelExtra: (panel, context) => <EditorManagerMenuPopover panel={panel} context={context} />,
        disableFloat: true,
        disableSinglePanelMove: true
      },
      dockbox: {
        mode: 'horizontal',
        children: [
          {
            tabs: [defaultEditor('1', firstNoteId)]
          }
        ]
      }
    }),
    []
  )

  useEffect(() => {
    eventEmitter.addListener('editor', eventHandler)
    return () => {
      eventEmitter.removeListener('editor', eventHandler)
    }
  }, [])

  return (
    <DockLayout
      defaultLayout={defaultLayout}
      ref={layoutRef}
      dropMode="edge"
      style={{
        position: 'absolute',
        inset: 0
      }}
    />
  )
}

export default EditorManager