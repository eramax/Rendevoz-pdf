import { FC, memo, useRef } from 'react'
import { fabric } from 'fabric-pure-browser'
import { useIsomorphicLayoutEffect } from 'react-use'
import { IEvent } from 'fabric/fabric-impl'
import { TextContent, TextStyle } from 'pdfjs-dist/types/src/display/api'
import PdfJs from '../types/pdfJsApi'
import { PageViewport, PDFPageProxy } from 'pdfjs-dist'
import { getNearestDistanceBetweenPointAndRect, getTextRect, getWordRect, isInBounds, isInRect } from '../utils/text'
import { useMousePositionWithRef } from '@/hooks/utils/useMousePositionRef'
import { Point } from '../types/point'
import useEventEmitter from '@/events/useEventEmitter'
import { PdfEventHandler } from '@/events/pdfEvent'
import { TextContentBound, TextItem, TextRect } from '../types/text'
import isHotkey from 'is-hotkey'
interface TextLayerProps {
  page: PDFPageProxy
  pageIndex: number
  scale: number
  rotation: number
  width: number
  height: number
  viewport: PageViewport
}

const DEFAULT_DISTANCE_TOLERANCE = 6
const DEFAULT_HIGHLIGHT_COLOR = '#8590AE'
const TextLayer: FC<TextLayerProps> = ({ page, scale, rotation, width, height, pageIndex, viewport }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas>()
  const renderTaskRef = useRef<TextLayerRenderTask>()
  const tempTextCanvasCtx = document.createElement('canvas').getContext('2d', { alpha: false })
  const textContentBounds = useRef<TextContentBound[]>([])
  const rectsRef = useRef<fabric.Rect[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const mousePos = useRef<Point | null>(null)
  const mousePosRef = useMousePositionWithRef(canvasRef)
  const selectedTextRef = useRef('')
  const emitter = useEventEmitter()
  const distanceToleranceAfterScale = Math.min(16, DEFAULT_DISTANCE_TOLERANCE * scale)
  const handler = new PdfEventHandler()

  handler.on('cancelTextSelect', () => emptyTextLayer())
  const keyboardHandler = (e: KeyboardEvent) => {
    if (
      isHotkey('mod+c', e) &&
      (window.getSelection()?.toString() == '' || window.getSelection() === null) &&
      selectedTextRef.current !== ''
    ) {
      navigator.clipboard.writeText(selectedTextRef.current)
    }
  }
  const mouseEventHandler = (e: IEvent<Event>) => {
    const type = e.e.type as 'mousedown' | 'mouseup' | 'mousemove' | 'dblclick'
    if (type === 'mousedown') {
      mousePos.current = null
    }
    const { elX, elY } = mousePosRef.current

    if (type === 'mousedown') {
      if (isInTextBound({ x: elX, y: elY }, distanceToleranceAfterScale)) {
        mousePos.current = {
          x: elX,
          y: elY
        }
      }
      if (rectsRef.current.length != 0) {
        emitter.emit('pdf', {
          type: 'textSelect',
          data: {
            pageIndex,
            isCancel: true
          }
        })
      }
      emptyTextLayer()
    }
    if (type === 'dblclick') {
      if (isInTextBound({ x: elX, y: elY }, distanceToleranceAfterScale)) {
        mousePos.current = {
          x: elX,
          y: elY
        }
        chooseWord(mousePos.current, distanceToleranceAfterScale)
        emitter.emit('pdf', {
          type: 'textSelect',
          data: {
            pageIndex,
            selectedText: selectedTextRef.current,
            isCancel: false,
            rects: rectsRef.current.map(rect => {
              return {
                left: rect.left,
                top: rect.top,
                percentageLeft: rect.left / width,
                percentageTop: rect.top / height,
                width: rect.width,
                height: rect.height,
                percentageHeight: rect.height / height,
                percentageWidth: rect.width / width
              }
            })
          }
        })
        mousePos.current = null
      }
    }
    if (type === 'mousemove' || type === 'mouseup') {
      if (!mousePos.current || type === 'mouseup') {
        if (isInTextBound({ x: elX, y: elY }, 6)) {
          fabricRef.current?.setCursor('text')
        } else {
          fabricRef.current?.setCursor('default')
        }
      }
      if (type === 'mousemove' && mousePos.current) {
        selectText(mousePos.current, { x: mousePosRef.current.elX, y: mousePosRef.current.elY }, distanceToleranceAfterScale)
      }
      if (type === 'mouseup' && mousePos.current && rectsRef.current.length !== 0) {
        emitter.emit('pdf', {
          type: 'textSelect',
          data: {
            pageIndex,
            selectedText: selectedTextRef.current,
            isCancel: false,
            rects: rectsRef.current.map(rect => {
              return {
                left: rect.left,
                top: rect.top,
                percentageLeft: rect.left / width,
                percentageTop: rect.top / height,
                width: rect.width,
                height: rect.height,
                percentageHeight: rect.height / height,
                percentageWidth: rect.width / width
              }
            })
          }
        })
      }
      if (type === 'mouseup') {
        mousePos.current = null
      }
    }
  }
  const emptyTextLayer = () => {
    const fabric = fabricRef.current
    if (!fabric) {
      return
    }
    rectsRef.current = []
    fabric.clear()
  }

  useIsomorphicLayoutEffect(() => {
    emitter.addListener('pdf', handler)
    const container = containerRef.current
    if (!container) {
      return
    }
    renderTaskRef.current = new TextLayerRenderTask(viewport)
    page.getTextContent().then(content => {
      emptyTextLayer()
      textContentBounds.current = renderTaskRef.current.render(content)
      if (!fabricRef.current) {
        fabricRef.current = new fabric.Canvas(canvasRef.current, {
          width,
          height,
          selection: false,
          moveCursor: 'text',
          hoverCursor: 'text'
        })
      }
      fabricRef.current.on('mouse:down', mouseEventHandler)
      fabricRef.current.on('mouse:move', mouseEventHandler)
      fabricRef.current.on('mouse:up', mouseEventHandler)
      fabricRef.current.on('mouse:dblclick', mouseEventHandler)
      document.addEventListener('keydown', keyboardHandler)
    })
    return () => {
      // when use fabric.dispose it throws error, why?
      // so i have to clear & removeListeners
      emptyTextLayer()
      fabricRef.current?.clear()
      fabricRef.current?.removeListeners()
      fabricRef.current = null
      document.removeEventListener('keydown', keyboardHandler)
      emitter.removeListener('pdf', handler)
    }
  }, [viewport])

  const isInTextBound = (point: Point, distanceTolerance: number) => {
    return !textContentBounds.current.length || point.x < 0 || point.y < 0
      ? false
      : isInBounds(textContentBounds.current, point, distanceTolerance)
  }
  const selectText = (startPoint: Point, endPoint: Point, distanceTolerance: number) => {
    // out of bounds
    if (startPoint.x < 0 || startPoint.y < 0) return
    // no text / too short select distance
    if (!textContentBounds.current.length || (Math.abs(startPoint.x - endPoint.x) <= 1 && Math.abs(startPoint.y - endPoint.y) <= 1)) return
    let startIndex = -1
    let distance = Infinity
    startPoint.x === 0 && startPoint.y === 0 && (startIndex = 0)
    const length = textContentBounds.current.length
    const indexes = {
      // tolerance index
      insideBoundIndex: -1,
      possibleIndex: -1,
      // no tolerance index
      insideIndex: -1
    }
    for (let i = 0; i < length; i += 1) {
      const textContent = textContentBounds.current[i]
      // get start index
      if (isInRect(textContent.offset, startPoint, distanceTolerance)) {
        const distanceBetweenPointAndRect = getNearestDistanceBetweenPointAndRect(textContent.offset, startPoint)
        if (distanceBetweenPointAndRect < distance) {
          startIndex = i
          distance = distanceBetweenPointAndRect
        }
      }
      if (Math.abs(endPoint.x - viewport.width) <= 1 && Math.abs(endPoint.y - viewport.height) <= 1) {
        indexes.possibleIndex = textContentBounds.current.length - 1
      } else if (isInRect(textContent.offset, endPoint, distanceTolerance)) {
        if (isInRect(textContent.offset, endPoint, 0)) {
          indexes.insideIndex = i
        } else {
          indexes.insideIndex !== 0 && (indexes.insideBoundIndex = i)
        }
      }
    }
    const endIndex =
      indexes.insideIndex >= 0 ? indexes.insideIndex : indexes.insideBoundIndex >= 0 ? indexes.insideBoundIndex : indexes.possibleIndex
    startIndex >= 0 &&
      endIndex >= 0 &&
      (startIndex <= endIndex
        ? paintRects(textContentBounds.current.slice(startIndex, endIndex + 1), startPoint, endPoint)
        : paintRects(textContentBounds.current.slice(endIndex, startIndex + 1), endPoint, startPoint))
  }
  const paint = (coordinate: { x: any; y: any; width: any; height: any; offset: any }, color: string) => {
    const { x, y, width, height, offset } = coordinate
    let rect
    if (offset && offset.angle) {
      rect = new fabric.Rect({
        left: x + offset.dx,
        top: y + offset.dy,
        width: width,
        height: height,
        fill: color,
        opacity: 0.5,
        backgroundColor: color
      })
    } else {
      rect = new fabric.Rect({
        left: x,
        top: y,
        width: width,
        height: height,
        fill: color,
        opacity: 0.5,
        backgroundColor: color
      })
    }
    rectsRef.current.push(rect)
    fabricRef.current?.add(rect)
  }
  const optimizeRects = (rects: TextRect[]) => {
    const optimized: any[] = []
    rects.reduce((prev, curr) => {
      const last = prev[prev.length - 1]
      last && last.y === curr.y ? ((last.width = curr.x - last.x + curr.width), (last.text += curr.text)) : prev.push(curr)
      return prev
    }, optimized)
    optimized.forEach(op => {
      ;['x', 'y', 'width', 'height'].forEach(i => {
        op[i] = Math.round(op[i] * 100) / 100
      })
    })
    return optimized
  }
  const chooseWord = (point: Point, distanceTolerance: number) => {
    if (!textContentBounds.current.length || point.x < 0 || point.y < 0 || !fabricRef.current) return
    let targetIndex = -1,
      distance = Infinity
    for (let i = 0; i < textContentBounds.current.length; i += 1) {
      const textContentBound = textContentBounds.current[i]
      if (isInRect(textContentBound.offset, point, distanceTolerance)) {
        const distanceBetweenPointAndRect = getNearestDistanceBetweenPointAndRect(textContentBound.offset, point)
        distanceBetweenPointAndRect < distance && ((targetIndex = i), (distance = distanceBetweenPointAndRect))
      }
    }
    const targetBound = textContentBounds.current[targetIndex]
    if (!targetBound) return
    const wordRect = getWordRect(targetBound, point, viewport)
    selectedTextRef.current = wordRect?.text
    paint(
      {
        x: wordRect?.x,
        y: wordRect?.y,
        width: wordRect?.width,
        height: wordRect?.height,
        offset: wordRect?.offset
      },
      DEFAULT_HIGHLIGHT_COLOR
    )
  }
  const paintRects = (bounds: TextContentBound[], p1: Point, p2: Point) => {
    if (!bounds.length) return
    emptyTextLayer()
    const isEnd = (point: Point) => {
      return point.x === viewport.width && point.y === viewport.height
    }
    const rects: TextRect[] = []
    if (bounds.length === 1) {
      rects.push(getTextRect(bounds[0], tempTextCanvasCtx, [p1, p2], viewport))
    } else {
      const first = bounds.shift()
      const end = bounds.pop()
      rects.push(getTextRect(first, tempTextCanvasCtx, [p1, null], viewport))
      bounds.forEach((be: any) => {
        rects.push(getTextRect(be, tempTextCanvasCtx, [null, null], viewport))
      })
      rects.push(getTextRect(end, tempTextCanvasCtx, [null, isEnd(p2) ? null : p2], viewport))
    }
    const optimizedRects = optimizeRects(rects)
    selectedTextRef.current = ''
    optimizedRects.forEach(rect => {
      const text = (rect.text as string).trim()
      selectedTextRef.current += text
    })
    optimizedRects.forEach(rect => {
      paint(rect, DEFAULT_HIGHLIGHT_COLOR)
    })
  }
  return (
    <div
      key={scale}
      style={{
        position: 'absolute',
        top: 0,
        left: 0
      }}
      ref={containerRef}
    >
      <canvas ref={canvasRef} />
    </div>
  )
}
class TextLayerRenderTask {
  private viewport
  private ctx
  constructor(viewport: PageViewport) {
    this.viewport = viewport
    const canvas = document.createElement('canvas')
    canvas.height = canvas.width = DEFAULT_FONT_SIZE
    this.ctx = canvas.getContext('2d', { alpha: false })
  }
  isTextItem = (ti: any) => {
    return ti?.['str'] !== undefined
  }
  buildTextBounds = (textContent: TextContent): TextContentBound[] => {
    const textContentBounds: TextContentBound[] = []
    textContent.items.forEach(item => {
      if (this.isTextItem(item)) {
        const i = item as TextItem
        const bound = getTextBound(this.viewport, i, this.ctx, textContent.styles)
        if (bound) {
          textContentBounds.push({ ...bound, str: i.str, textItem: i })
        }
      }
    })
    return textContentBounds
  }
  render = (textContent: TextContent) => {
    return this.buildTextBounds(textContent)
  }
}

type styleType = {
  [x: string]: TextStyle
}
function getTextBound(viewport: PageViewport, textItem: TextItem, ctx: CanvasRenderingContext2D, styles: styleType) {
  const textItemTransform = PdfJs.Util.transform(viewport.transform, textItem.transform)
  let angle = Math.atan2(textItemTransform[1], textItemTransform[0])
  const style = styles[textItem.fontName]
  if (style.vertical) {
    angle += Math.PI / 2
  }
  const height = Math.hypot(textItemTransform[2], textItemTransform[3])
  const ascentFontSize = height * getAscent(style.fontFamily, ctx)
  let left, top
  if (
    (angle === 0
      ? ((left = textItemTransform[4]), (top = textItemTransform[5] - ascentFontSize))
      : ((left = textItemTransform[4] + ascentFontSize * Math.sin(angle)), (top = textItemTransform[5] - ascentFontSize * Math.cos(angle))),
    textItem.str !== '')
  ) {
    let angleCos = 1,
      angleSin = 0
    angle !== 0 && ((angleCos = Math.cos(angle)), (angleSin = Math.sin(angle)))
    const afterScaleWidth = (style.vertical ? textItem.height : textItem.width) * viewport.scale
    let trans, bound
    angle !== 0
      ? ((trans = [angleCos, angleSin, -angleSin, angleCos, left, top]),
        (bound = PdfJs.Util.getAxialAlignedBoundingBox([0, 0, afterScaleWidth, height], trans)))
      : (bound = [left, top, left + afterScaleWidth, top + height])
    return {
      offset: {
        left: bound[0],
        top: bound[1],
        right: bound[2],
        bottom: bound[3],
        size: [afterScaleWidth, height],
        trans,
        angle
      },
      style: { ...style, fontSize: height }
    }
  }
  return null
}
const ascentCache = new Map()
const DEFAULT_FONT_SIZE = 30

const DEFAULT_FONT_ASCENT = 0.8
function getAscent(fontFamily: string, ctx: CanvasRenderingContext2D) {
  const ascent = ascentCache.get(fontFamily)
  if (ascent) {
    return ascent
  }
  ctx.save()
  ctx.font = `${DEFAULT_FONT_SIZE}px ${fontFamily}`
  const blankWidth = ctx.measureText('')
  let fontAscent = blankWidth.fontBoundingBoxAscent
  let fontDescent = Math.abs(blankWidth.fontBoundingBoxDescent)
  if (fontAscent) {
    ctx.restore()
    const realAscent = fontAscent / (fontAscent + fontDescent)
    ascentCache.set(fontFamily, realAscent)
    return realAscent
  }
  ctx.strokeStyle = 'red'
  ctx.clearRect(0, 0, DEFAULT_FONT_SIZE, DEFAULT_FONT_SIZE)
  ctx.strokeText('g', 0, 0)
  let imgData = ctx.getImageData(0, 0, DEFAULT_FONT_SIZE, DEFAULT_FONT_SIZE).data
  fontDescent = 0
  for (let i = imgData.length - 4; i >= 0; i -= 4) {
    if (imgData[i] > 0) {
      fontDescent = Math.ceil(i / 4 / DEFAULT_FONT_SIZE)
      break
    }
  }
  ctx.clearRect(0, 0, DEFAULT_FONT_SIZE, DEFAULT_FONT_SIZE)
  ctx.strokeText('A', 0, DEFAULT_FONT_SIZE)
  imgData = ctx.getImageData(0, 0, DEFAULT_FONT_SIZE, DEFAULT_FONT_SIZE).data
  fontAscent = 0
  for (let i = 0; i < imgData.length; i += 4) {
    if (imgData[i] > 0) {
      fontAscent = DEFAULT_FONT_SIZE - Math.floor(i / 4 / DEFAULT_FONT_SIZE)
      break
    }
  }
  if ((ctx.restore(), fontAscent)) {
    const _realAscent = fontAscent / (fontAscent + fontDescent)
    return ascentCache.set(fontFamily, _realAscent), DEFAULT_FONT_ASCENT
  }
}
export default memo(TextLayer)
