import { EditorEventHandler } from '@/events/editorEvent'
import useEventEmitter from '@/events/useEventEmitter'
import { useToggle } from '@/hooks/utils'
import { forwardRef, memo, useCallback, useEffect, useRef, useState } from 'react'
import { Content, WithBorder } from '@/components/base'
import { useSelectedEditorRef } from './hooks/useSelectedEditorRef'
import ThoughtFlow from './components/mindmap'
import { addEdge, MiniMap, ReactFlowInstance, ReactFlowProvider, useEdgesState, useNodesState } from 'react-flow-renderer'
import { Descendant } from 'slate'
import InsertNodeForm from './components/mindmap/InsertNodeForm'
import Id from '@/utils/id'
import { AnimatePresence, motion } from 'framer-motion'
import { hexToRgb } from '@/utils/color'
import styles from './index.module.less'
import { Noop } from '@/common/types'
import classNames from 'classnames'
import { delay } from 'lodash'
import MindmapToolbar from './components/mindmap/Toolbar'
import isHotkey from 'is-hotkey'

interface CustomLayersProps {
  value: Descendant[]
  visible: boolean
  onClose: Noop
}
const MindmapLayer = forwardRef<HTMLDivElement, CustomLayersProps>(({ value, visible, onClose }, ref) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [newNode, setNewNode] = useState()
  const newNodeRef = useRef<HTMLDivElement>(null)
  const currentSelectEdgeRef = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance>(null)
  const [fullScreen, setFullScreen] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [formDraggable, setFormDraggble] = useState(true)
  const emitter = useEventEmitter()
  const handler = new EditorEventHandler()

  const onConnect = useCallback(connection => setEdges(eds => addEdge(connection, eds)), [])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log(e)
      if (isHotkey('delete', e)) {
        console.log('delted')
        setEdges(eds => eds.filter(i => i.id !== currentSelectEdgeRef.current))
      }
    }
    contentRef.current?.addEventListener('keydown', handleKeyDown)
    emitter.addListener('editor', handler)
    return () => {
      contentRef.current?.removeEventListener('keydown', handleKeyDown)
      emitter.removeListener('editor', handler)
    }
  })

  const handleInsertNewNode = node => {
    setNewNode(node)
    setFormVisible(false)
  }

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const newNodeEle = newNodeRef.current
      if (newNodeEle) {
        const rect = contentRef.current?.getBoundingClientRect()
        newNodeEle.style.left = `${e.pageX - rect?.left}px`
        newNodeEle.style.top = `${e.pageY - rect?.top}px`
      }
    }
    const handleDrop = (e: MouseEvent) => {
      const rect = contentRef.current?.getBoundingClientRect()
      const position = reactFlowInstance.project({
        x: e.clientX - rect?.left,
        y: e.clientY - rect?.top
      })
      console.log(newNode)
      const rgba = hexToRgb(newNode.backgroundColor)
      setNodes(nodes => [
        ...nodes,
        {
          type: 'default',
          id: Id.getStrId(),
          data: {
            label: newNode.content
          },
          style: {
            backgroundColor: `rgba(${rgba?.r},${rgba?.g},${rgba?.b},0.5)`
          },
          position
        }
      ])
      setNewNode(undefined)
    }
    if (newNode !== undefined) {
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('pointerdown', handleDrop)
    }
    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('pointerdown', handleDrop)
    }
  }, [newNode])
  useEffect(() => {
    if (reactFlowInstance) {
      delay(() => reactFlowInstance.fitView(), 10)
    }
  }, [fullScreen])
  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{opacity: 0}}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'tween' }}
            ref={contentRef}
            className={classNames(styles.mindmapContainer, fullScreen ? styles.fullScreen : null)}
          >
            <ThoughtFlow
              deleteKeyCode={['Backspace', 'Delete']}
              onInit={setReactFlowInstance}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodes={nodes}
              edges={edges}
              onConnect={onConnect}
            />
            <div style={{ position: 'absolute', top: '50%', left: 15, transform: 'translateY(-50%)', zIndex: 999 }}>
              <MindmapToolbar
                onAddNode={() => setFormVisible(!formVisible)}
                onZoomIn={() => reactFlowInstance.zoomIn()}
                onZoomOut={() => reactFlowInstance.zoomOut()}
                onFullScreen={() => setFullScreen(!fullScreen)}
                onOffScreen={() => setFullScreen(false)}
                onClose={onClose}
              />
            </div>
            <AnimatePresence>
              {formVisible && (
                <motion.div
                  dragMomentum={false}
                  drag={formDraggable}
                  onMouseDown={e => {
                    if (e.target.nodeName === 'INPUT') {
                      setFormDraggble(false)
                    }
                  }}
                  onMouseUp={() => setFormDraggble(true)}
                  key={`${fullScreen}`}
                  style={{
                    position: 'absolute',
                    width: '350px',
                    left: 'calc(50% - 175px)',
                    top: '30%',
                    zIndex: 100
                  }}
                >
                  <WithBorder style={{ padding: '12px' }}>
                    <InsertNodeForm onBack={() => setFormVisible(false)} onSubmit={handleInsertNewNode} />
                  </WithBorder>
                </motion.div>
              )}
            </AnimatePresence>

            {newNode && (
              <div ref={newNodeRef} style={{ position: 'absolute', backgroundColor: newNode.backgroundColor }}>
                {newNode.content}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
})
export default memo(MindmapLayer)
