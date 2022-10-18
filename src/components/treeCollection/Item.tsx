import { useMemoizedFn } from '@/hooks'
import { createElement, DragEvent, MouseEventHandler, useEffect, useRef, useState } from 'react'
import { Content } from '../base'
import Icon from '../base/Icon'
import useDraggingState from './draggingState'
import styles from './index.module.less'
import classNames from 'classnames'
import useCollectionStore from '@/stores/collection.store'
import { createPortal } from 'react-dom'

const TreeCollectionItem = ({
  name,
  type,
  id,
  onClick,
  collapsed
}: {
  name: string
  type: string
  id: number
  onClick: MouseEventHandler
  collapsed?: boolean
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragLayerRef = useRef<HTMLDivElement>(null)
  const { findParentCollections, one, findSubCollections } = useCollectionStore()
  const [draggingState, setDraggingState] = useDraggingState()
  const [isDragging, setIsDragging] = useState(false)
  const [indicator, setIndicator] = useState<string>()
  const handleDragStart = useMemoizedFn((e: DragEvent) => {
    const img = new Image()
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='
    e.dataTransfer.setDragImage(img, 0, 0)
    setIsDragging(true)
    setDraggingState({
      ...draggingState,
      isDragging: true,
      dragElementType: type,
      dragElementId: id,
      canDrop: true
    })
  })
  const handleDrag = useMemoizedFn((e: DragEvent) => {
    e.preventDefault()
    const draggingLayer = dragLayerRef.current
    if (draggingLayer) {
      if (!draggingLayer.firstElementChild?.hasChildNodes()) {
        const element = containerRef.current?.cloneNode(true)
        const rect = containerRef.current?.getBoundingClientRect()
        // draggingLayer.style.width = `${rect?.width}px`
        // draggingLayer.style.height = `${rect?.height}px`
        draggingLayer.firstElementChild.appendChild(element)
      }
      draggingLayer && ((draggingLayer as HTMLElement).style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`)
    }
  })
  const handleDragOver = useMemoizedFn((e: DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'none'
    if (draggingState.dragElementType === 'collection' && type === 'collection') {
      const draggingCollection = one(draggingState.dragElementId)
      const currentCollection = one(id)
      // current collection can't be dragging collection's parent
      if (id === draggingCollection?.parentId) {
        e.dataTransfer.dropEffect = 'none'
        return
      }
      // dragging collection can't be current collection's parent
      const currentCollectionParents = findParentCollections(currentCollection)
      if (currentCollectionParents.some(i => i.id === draggingState.dragElementId)) {
        e.dataTransfer.dropEffect = 'none'
        return
      }
      setDraggingState({
        ...draggingState,
        canDrop: true,
        dragOverElementName: name,
        dragOverElementType: type
      })
      e.dataTransfer.dropEffect = 'move'
    }
  })
  const handleDragEnd = () => {
    setIsDragging(false)
    setIndicator(undefined)
    setDraggingState({
      isDragging: false,
      canDrop: false,
      dragElementId: 0,
      dragElementType: '',
      dragOverElementName: '',
      dragOverElementType: ''
    })
  }
  useEffect(() => {
    const { canDrop, dragOverElementName, dragOverElementType } = draggingState
    if (canDrop) {
      if (isDragging) {
        console.log(draggingState)
        setIndicator('Move into ' + dragOverElementType + ': ' + dragOverElementName)
      }
    }
  }, [draggingState.dragOverElementName])
  const iconName = () => {
    switch (type) {
      case 'collection':
        return 'park-folder-close'
      case 'note':
        return 'park-notes'
      default:
        return 'park-folder-close'
    }
  }
  return (
    <>
      <Content
        onClick={onClick}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrag={handleDrag}
        onDragEnter={handleDragOver}
        onDragEnd={handleDragEnd}
        flex
        draggable={true}
        alignItems="center"
        gap={10}
        ref={containerRef}
        className={classNames(styles.item)}
      >
        {type === 'collection' && <Icon containerClassName={classNames(styles.icon, !collapsed && styles.collapsed)} name="park-right" />}
        <Icon name={iconName()} />
        <div>{name}</div>
      </Content>
      {isDragging && (
        <div
          className={styles.draggingElementContainer}
          style={{ position: 'fixed', left: 0, top: 0, zIndex: -1, pointerEvents: 'none', display: 'flex', flexDirection: 'column' }}
          ref={dragLayerRef}
        >
          <div></div>
          {indicator && <div className={styles.draggingIndicator}>{indicator}</div>}
        </div>
      )}
    </>
  )
}
export default TreeCollectionItem
